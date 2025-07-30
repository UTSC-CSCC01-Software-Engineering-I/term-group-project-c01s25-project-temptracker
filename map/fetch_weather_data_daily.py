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
load_dotenv()
import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

current_year = datetime.now().year
current_year_str = f"{current_year:04d}"
current_month = datetime.now().month
current_month_str = f"{current_month:02d}"
current_day = datetime.now().day
current_day_str = f"{current_day:02d}"
current_date = f"{current_year:04d}{current_month:02d}{current_day:02d}"

tomorrow = datetime.now() + timedelta(days=1)
tomorrows_date = f"{tomorrow.year:04d}{tomorrow.month:02d}{tomorrow.day:02d}"
t_number = '00'  
n_number = '006'
# f_number = '036'

def save_netcdf_from_url(url):
    """ Download a NetCDF file from a URL and save it locally. """
    filename = url[url.rfind("/") + 1:]
    (new_file, headers) = request.urlretrieve(url, f"glofs/{filename}")
    return new_file

# Point file
def generate_points(nc_file,date):
    ds = xr.open_dataset(nc_file)
    
    features = []
    
    # Assuming you have lat, lon, and some data variable
    lats = ds['lat'].values
    lons = ds['lon'].values
    temp_var = ds['temp'].values[0][0] # highest siglay layer
    
    for i in range(len(lats)):
        if np.isnan(temp_var[i]):
            print(f"Skipping node {i} due to NaN temperature")
            continue

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(((lons[i] + 180) % 360) - 180), float(lats[i])]
                    },
            "properties": {
                "temperature": float(temp_var[i]),
            }
        }
        features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    geojson_str = json.dumps(geojson)
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}_points_{(int(nc_file.split('.')[-2][2:])-24):02d}.geo.json'
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
    #TODO - normalize coordinates (long) before sending to bucket
    ds = xr.open_dataset(nc_file)
    nv = ds['nv'].values
    triangles = []
    for i in range(len(nv[0])):
        triangle = [x-1 for x in nv[:, i]]
        triangles.append(triangle)

    # Assuming you have lat, lon, and some data variable
    lats = ds['lat'].values
    lons = ds['lon'].values
    #normalize lon
    for i in range(len(lons)):
        lons[i] = ((lons[i] + 180) % 360) - 180
    temp_var = ds['temp'].values[0][0]


    contour_levels = [] # temperature levels to contour
    for i in range(0,32,2):
        contour_levels.append(i)

    custom_colors = ['#8B00FF','#4B0082',"#0000FF","#1E90FF","#00CED1","#00FA9A",
                    "#00FF00","#7CFC00","#ADFF2F","#FFD700","#FFA500","#FF8C00",
                    "#FF4500","#B22222","#8B0000"]

    fig = plt.figure(figsize=[20, 16])
    ax = fig.add_axes([0, 0, 1, 1])
    ax.scatter(lons, lats)

    triangulation = tri.Triangulation(lons, lats, triangles)
    contours = ax.tricontourf(triangulation, temp_var, levels=contour_levels, colors=custom_colors)


    geojson = geojsoncontour.contourf_to_geojson(
        contourf=contours,
        min_angle_deg=3.0,
        ndigits=5,
        stroke_width=1,
        fill_opacity=1)

    geojson_obj = json.loads(geojson)
    geojson_str = json.dumps(geojson_obj)
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}_{(int(nc_file.split('.')[-2][2:])-24):02d}.geo.json'

    plt.close()
    
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
    try:
        # List all files in the folder
        files = supabase.storage.from_(bucket_name).list(folder_path)
        
        if files:
            # Create list of file paths to delete
            file_paths = []
            for file in files:
                file_path = f"{folder_path}/{file['name']}"
                file_paths.append(file_path)
            
            # Delete all files in the folder
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
url_list = []
lakes = ['loofs', 'leofs', 'lsofs', 'lmhofs']
for lake in lakes:
    # url_list.append(f"https://noaa-nos-ofs-pds.s3.amazonaws.com/{lake}/netcdf/{current_year_str}/{current_month_str}/{current_day_str}/{lake}.t{t_number}z.{current_date}.fields.n{n_number}.nc")
    # url_list.append(f"https://noaa-nos-ofs-pds.s3.amazonaws.com/{lake}/netcdf/{current_year_str}/{current_month_str}/{current_day_str}/{lake}.t{t_number}z.{current_date}.fields.f{f_number}.nc")
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

            retrieved_file = save_netcdf_from_url(url)
            print('retrieved file:',retrieved_file)
            
            generate_contours(retrieved_file,tomorrows_date)
            generate_points(retrieved_file,tomorrows_date)
            print('\n')
            
        os.remove(retrieved_file)

        

    # delete older files from yesterday ago, except 12 pm files
    remove_date = datetime.now() - timedelta(days=1)
    remove_date_str = f"{remove_date.year:04d}{remove_date.month:02d}{remove_date.day:02d}"
    print('file removal date:', remove_date_str)
    delete_list = []
    for lake in lakes:
        for hour in ['00','04','08','16','20']:
            delete_list.append(f'{remove_date_str}/{lake}_{remove_date_str}_{hour}.geo.json')
            delete_list.append(f'{remove_date_str}/{lake}_{remove_date_str}_points_{hour}.geo.json')
    response = supabase.storage.from_('geojson').remove(delete_list)

    # delete older folder from one week ago
    remove_date = datetime.now() - timedelta(days=7)
    remove_date_str = f"{remove_date.year:04d}{remove_date.month:02d}{remove_date.day:02d}"
    print('file removal date:', remove_date_str)
    response = delete_folder_contents('geojson', remove_date_str)

    with open('daily_log.txt', 'a') as log:
        log.write(f'Passed on {current_date}\n')

except Exception as e:
    print("Error:", e)

    with open('daily_log.txt', 'a') as log:
        log.write(f'Failed on {current_date}. Error: {e}\n')