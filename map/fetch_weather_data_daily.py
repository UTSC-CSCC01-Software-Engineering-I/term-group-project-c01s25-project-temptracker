import xarray as xr
import json
import numpy as np
import os
from datetime import datetime, timedelta
from urllib import request
import matplotlib.tri as tri
import matplotlib.pyplot as plt
import geojsoncontour
from dotenv import load_dotenv
import os
from supabase import create_client

# load environmental variables
load_dotenv()

# initialize supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# generate date string for the current day and tomorrow, following YYYYMMDD
current_year = datetime.now().year
current_year_str = f"{current_year:04d}"
current_month = datetime.now().month
current_month_str = f"{current_month:02d}"
current_day = datetime.now().day
current_day_str = f"{current_day:02d}"
current_date = f"{current_year:04d}{current_month:02d}{current_day:02d}"

tomorrow = datetime.now() + timedelta(days=1)
tomorrows_date = f"{tomorrow.year:04d}{tomorrow.month:02d}{tomorrow.day:02d}"

# noaa forecast system identifiers
t_number = '00'  
n_number = '006'

def save_netcdf_from_url(url):
    """
    Download a NetCDF file from a URL and save it locally.
    """

    filename = url[url.rfind("/") + 1:]

    # download the file to 'glofs' directory
    (new_file, headers) = request.urlretrieve(url, f"glofs/{filename}")
    return new_file

# Point file
def generate_points(nc_file,date):
    """
    Extract temperature data points from NetCDF and create GeoJSON point features.
    Uploads the resulting GeoJSON to Supabase storage.
    """

    # open the dataset
    ds = xr.open_dataset(nc_file)
    
    features = []
    
    # extract lat, lon, and temperature variable
    lats = ds['lat'].values
    lons = ds['lon'].values
    temp_var = ds['temp'].values[0][0] # highest siglay layer (surface temperature)
    
    # iterate through each spatial node
    for i in range(len(lats)):
        # skip nodes with NaN temperature
        if np.isnan(temp_var[i]):
            print(f"Skipping node {i} due to NaN temperature")
            continue

        # create a geojson point feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                # normalize longitude to -180 to 180
                "coordinates": [float(((lons[i] + 180) % 360) - 180), float(lats[i])]
                    },
            "properties": {
                "temperature": float(temp_var[i]),
            }
        }
        features.append(feature)
    # construct complete geojson feature collection
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    geojson_str = json.dumps(geojson)
    # generate filename
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}_points_{(int(nc_file.split('.')[-2][2:])-24):02d}.geo.json'
    # upload to supabase storage
    try:
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=f'{date}/{filename}',
                file_options={
                        "content-type": "application/json",
                        "cache-control": "3600",
                        "upsert": "true" 
                    }
            )
        print(f"Successfully uploaded {filename} to Supabase")
    except Exception as error:
        print(f"Error uploading to Supabase: {error}")

def generate_contours(nc_file,date):
    """
    Generate temperature contour polygons from NetCDF triangular mesh data.
    Creates filled contours and exports as GeoJSON.
    """

    # open the dataset
    ds = xr.open_dataset(nc_file)
    # get node connectivity data
    nv = ds['nv'].values
    triangles = []
    # build triangle list
    for i in range(len(nv[0])):
        triangle = [x-1 for x in nv[:, i]]
        triangles.append(triangle)

    # extract lat and lon
    lats = ds['lat'].values
    lons = ds['lon'].values
    #normalize longitude coords
    for i in range(len(lons)):
        lons[i] = ((lons[i] + 180) % 360) - 180
    
    # get surface temperature values
    temp_var = ds['temp'].values[0][0]

    # define temperature contour levels (0°C to 30°C in 2° increments)
    contour_levels = [] # temperature levels to contour
    for i in range(0,32,2):
        contour_levels.append(i)

    custom_colors = ['#8B00FF','#4B0082',"#0000FF","#1E90FF","#00CED1","#00FA9A",
                    "#00FF00","#7CFC00","#ADFF2F","#FFD700","#FFA500","#FF8C00",
                    "#FF4500","#B22222","#8B0000"]
    # create figure, and plot nodes
    fig = plt.figure(figsize=[20, 16])
    ax = fig.add_axes([0, 0, 1, 1])
    ax.scatter(lons, lats)

    # create triangulation object from triangles
    triangulation = tri.Triangulation(lons, lats, triangles)
    # generate filled contours using triangular interpolation
    contours = ax.tricontourf(triangulation, temp_var, levels=contour_levels, colors=custom_colors)

    # convert matplotlib contourf to geojson
    geojson = geojsoncontour.contourf_to_geojson(
        contourf=contours,
        min_angle_deg=3.0,
        ndigits=5,
        stroke_width=1,
        fill_opacity=1)

    geojson_obj = json.loads(geojson)
    geojson_str = json.dumps(geojson_obj)

    # generate filename
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}_{(int(nc_file.split('.')[-2][2:])-24):02d}.geo.json'

    # close plot
    plt.close()
    
    # upload contour to supabase
    try:
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=f'{date}/{filename}',
                file_options={
                        "content-type": "application/json",
                        "cache-control": "3600",
                        "upsert": "true" 
                    }
            )
        print(f"Successfully uploaded {filename} to Supabase")
    except Exception as error:
        print(f"Error uploading to Supabase: {error}")

def delete_folder_contents(bucket_name, folder_path):
    """
    Delete all files within a specific folder in Supabase storage.
    Used for removing old forecast data to manage storage space.
    """

    try:
        # List all files in the folder
        files = supabase.storage.from_(bucket_name).list(folder_path)
        
        if files:
            # Create list of file paths to delete
            file_paths = []
            for file in files:
                file_path = f"{folder_path}/{file['name']}"
                file_paths.append(file_path)
            
            # Delete all files in the batch
            result = supabase.storage.from_(bucket_name).remove(file_paths)
            
            return result
        else:
            print(f"No files found in folder: {folder_path}")
            return None
            
    except Exception as e:
        print(f"Error deleting folder contents: {e}")
        return None
    
print('today:',current_date)
print('tomorrow:', tomorrows_date)
# build list of URLs to download
url_list = []
lakes = ['loofs', 'leofs', 'lsofs', 'lmhofs']
for lake in lakes:
    # select forecast data from 4 hour intervals
    for hour in range(24, 48, 4):
            f_number = f"{hour:03}"
            url_list.append(
                f"https://noaa-nos-ofs-pds.s3.amazonaws.com/{lake}/netcdf/{current_year_str}/{current_month_str}/{current_day_str}/{lake}.t{t_number}z.{current_date}.fields.f{f_number}.nc")


# generate 
try:
    for url in url_list:
        print('url:',url)
        # create staging file
        name = url.split('/')[-1]
        with open(f'glofs/{name}', 'w') as f:
            pass
            # download file
            retrieved_file = save_netcdf_from_url(url)
            print('retrieved file:',retrieved_file)
            
            # generate and upload contours and points
            generate_contours(retrieved_file,tomorrows_date)
            generate_points(retrieved_file,tomorrows_date)
            print('\n')
        # remove staging file
        os.remove(retrieved_file)

        

    # delete older files from yesterday ago, except 12 pm files
    remove_date = datetime.now() - timedelta(days=(1))
    remove_date_str = f"{remove_date.year:04d}{remove_date.month:02d}{remove_date.day:02d}"
    print('file removal date:', remove_date_str)
    delete_list = []
    for lake in lakes:
        for hour in ['00','04','08','16','20']:
            delete_list.append(f'{remove_date_str}/{lake}_{remove_date_str}_{hour}.geo.json')
            delete_list.append(f'{remove_date_str}/{lake}_{remove_date_str}_points_{hour}.geo.json')
    # delete
    response = supabase.storage.from_('geojson').remove(delete_list)

    # delete older folder from one week ago ( to ensure the storage bucket has atmost 7 days worth of data at a time)
    remove_date = datetime.now() - timedelta(days=7)
    remove_date_str = f"{remove_date.year:04d}{remove_date.month:02d}{remove_date.day:02d}"
    print('file removal date:', remove_date_str)
    response = delete_folder_contents('geojson', remove_date_str)

    # log successful execution
    with open('daily_log.txt', 'a') as log:
        log.write(f'Passed on {current_date}\n')

except Exception as e:
    print("Error:", e)
    # log failure
    with open('daily_log.txt', 'a') as log:
        log.write(f'Failed on {current_date}. Error: {e}\n')