import xarray as xr
from io import BytesIO
import netCDF4 as nc
import json
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
from datetime import datetime, date
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
t_number = '00'  
n_number = '006'

def save_netcdf_from_url(url):
    """ Download a NetCDF file from a URL and save it locally. """
    print(url)
    filename = url[url.rfind("/") + 1:]
    print('new local name:', filename)
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
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}_points.geo.json'
    try:
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=f'{current_date}/{filename}',
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
    filename = nc_file.split('/')[1].split('.')[0] + f'_{date}.geo.json'
    
    try:
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=f'{current_date}/{filename}',
                file_options={
                        "content-type": "application/json",
                        "cache-control": "3600",
                        "upsert": "true" 
                    }
            )
        print(f"Successfully uploaded {filename} to Supabase")
    except Exception as error:
        print(f"Error uploading to Supabase: {error}")


def generate_misc_points(d):
    year = int(d[:4])
    month = int(d[4:6])
    day = int(d[6:])
    target_date = date(year,month,day)
    print('target date',target_date)
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())

    try:
        data = supabase.table("temperatures").select("temperature, longitude, latitude, measured_on, is_verified") \
        .gte('measured_on', start_datetime.isoformat()) \
        .lte('measured_on', end_datetime.isoformat()).execute()

        features = []

        for row in data.data:
            print(row)
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(((row["longitude"] + 180) % 360) - 180), float(row["latitude"])]
                        },
                "properties": {
                    "temperature": float(row["temperature"]),
                }
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        geojson_str = json.dumps(geojson)
        filename = f'{target_date.strftime('%Y%m%d')}/user_points.geo.json'
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=filename,
                file_options={
                        "content-type": "application/json",
                        "cache-control": "3600",
                        "upsert": "true" 
                    }
            )
        print(f"Successfully uploaded {filename} to Supabase")

    except Exception as e:
        print(f'supabase database error:', e)


print(current_date)
url_list = []
lakes = ['loofs', 'leofs', 'lsofs', 'lmhofs']
for lake in lakes:
    url_list.append(f"https://noaa-nos-ofs-pds.s3.amazonaws.com/{lake}/netcdf/{current_year_str}/{current_month_str}/{current_day_str}/{lake}.t{t_number}z.{current_date}.fields.n{n_number}.nc")


# generate 
for url in url_list:
    print('url:',url)
    # create staging file
    name = url.split('/')[-1]
    with open(f'glofs/{name}', 'w') as f:
        pass
    try:
        retrieved_file = save_netcdf_from_url(url)
        print(retrieved_file)

        # call convert and upload to storage
        generate_contours(retrieved_file,current_date)
        generate_points(retrieved_file,current_date)

        # delte staging file
        os.remove(retrieved_file)

    except Exception as e:
        print('Exception requesting file:', e)
try:
    generate_misc_points(current_date)
except Exception as e:
    print("Error uploading user points:", e)