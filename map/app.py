import requests
import xarray as xr
from io import BytesIO
import netCDF4 as nc
import h5netcdf
import boto3
import json
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
from datetime import datetime
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
current_month = datetime.now().month
current_day = datetime.now().day-1
date = f"{current_year:04d}{current_month:02d}{current_day:02d}"
t_number = '00'  
n_number = '006'

url_list = []
lakes = ['loofs', 'leofs', 'lsofs', 'lmhofs']
# print(ds)
for lake in lakes:
    url_list.append(f"https://noaa-nos-ofs-pds.s3.amazonaws.com/{lake}/netcdf/{current_year}/{current_month}/{current_day}/{lake}.t{t_number}z.{date}.fields.n{n_number}.nc")

def save_netcdf_from_url(url):
    """ Download a NetCDF file from a URL and save it locally. """
    print(url)
    filename = url[url.rfind("/") + 1:]
    (new_file, _) = request.urlretrieve(url, f"staging/glofs/{filename}")
    return new_file

# nf = save_netcdf_from_url(url_list[0])
# print(nf)

# Polygon file
# def netcdf_to_geojson(nc_file, output_file):
#     ds = xr.open_dataset(nc_file)
    
#     features = []
#     nv = ds['nv'].values
    
#     # Assuming you have lat, lon, and some data variable
#     lats = ds['lat'].values
#     lons = ds['lon'].values
#     temp_var = ds['temp'].values[0][0] # highest siglay layer
    
#     for i in range(len(nv[0])):
#         print(f"node {i}")
#         node_indices = [x-1 for x in nv[:,i]]
#         node_lons = lons[node_indices]
#         node_lats = lats[node_indices]

#         triangle_temps = temp_var[node_indices]
#         avg_temp = np.mean(triangle_temps)

#         if np.isnan(avg_temp):
#             print(f"Skipping node {i} due to NaN temperature")
#             continue

#         coordinates = []
#         for j in range(3):
#             coordinates.append([float(node_lons[j]), float(node_lats[j])])

#         feature = {
#             "type": "Feature",
#             "geometry": {
#                 "type": "Polygon",
#                 "coordinates": [coordinates]
#                     },
#             "properties": {
#                 "temperature": float(avg_temp),
#             }
#         }
#         features.append(feature)
    
#     geojson = {
#         "type": "FeatureCollection",
#         "features": features
#     }
    
#     with open(output_file, 'w') as f:
#         json.dump(geojson, f)

# Point file
# def netcdf_to_geojson_points(nc_file, output_file):
#     ds = xr.open_dataset(nc_file)
    
#     features = []
#     nv = ds['nv'].values
    
#     # Assuming you have lat, lon, and some data variable
#     lats = ds['lat'].values
#     lons = ds['lon'].values
#     temp_var = ds['temp'].values[0][0] # highest siglay layer
    
#     for i in range(len(lats)):
#         print(f"node {i}")

#         if np.isnan(temp_var[i]):
#             print(f"Skipping node {i} due to NaN temperature")
#             continue

#         feature = {
#             "type": "Feature",
#             "geometry": {
#                 "type": "Point",
#                 "coordinates": [float(lons[i]), float(lats[i])]
#                     },
#             "properties": {
#                 "temperature": float(temp_var[i]),
#             }
#         }
#         features.append(feature)
    
#     geojson = {
#         "type": "FeatureCollection",
#         "features": features
#     }
    
#     with open(output_file, 'w') as f:
#         json.dump(geojson, f)

# Usage

# for file in files:
#     output_file = file.split('.')[0] + '.geo.json'
#     print(f"Converting {file} to {output_file}")
#     netcdf_to_geojson(file, output_file)
# netcdf_to_geojson('loofs.t00z.20250716.fields.n006.nc', 'output.geo.json')


# netcdf_to_geojson_points('loofs.t00z.20250716.fields.n006.nc', 'output_points.geo.json')

#I need an algorithm to receive a point feature collection geo jons file. 
# Witth the points, I need to use breadth first search basically to find the largest body of points who all share the same temperature. 
# Once I have that body, I need to connect it to make a polygon. This is done by starting at a point on the border
# border points have only two edges. keep moving either right or left until I am back at the start? Then that new polygon is a simplified version
# of the body of points and reduces complexity.
#loop there all points, keep track of visited points somehow to avoid processing the same point multiple times


# i create a graph from the points, connected by edges
    

def generateContours(nc_file):
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
    filename = nc_file.split('.')[0] + f'_{date}.geo.json'
    # with open(filename, 'w') as f:
    #     json.dump(geojson_obj, f)
    try:
        response = supabase.storage.from_('geojson').upload(
                file=geojson_str.encode('utf-8'),
                path=filename,
                file_options={
                        "content-type": "application/json",
                        "cache-control": "3600",
                        "upsert": "true" 
                    }
            )
        print('response', response)
        print(f"Successfully uploaded {filename} to Supabase")
    except Exception as error:
        print(f"Error uploading to Supabase: {error}")
    
dates = ['20250715','20250716', '20250717', '20250718']
for date in dates:

    files = os.listdir(rf'./{date}')
    files = [rf'{date}/{f}' for f in files if f.endswith('.nc')]
    print(files)

    for file in files:
        print(f"Generating contours for {file}")
        generateContours(file)