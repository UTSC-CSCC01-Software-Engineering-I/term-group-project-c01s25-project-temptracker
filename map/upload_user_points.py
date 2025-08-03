import json
import os
from datetime import datetime, date, timedelta
from dotenv import load_dotenv
load_dotenv()
import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

current = datetime.now() - timedelta(days=1)
current_year = current.year
current_year_str = f"{current_year:04d}"
current_month = current.month
current_month_str = f"{current_month:02d}"
current_day = current.day
current_day_str = f"{current_day:02d}"
current_date = f"{current_year:04d}{current_month:02d}{current_day:02d}"



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


print("current date:", current_date)
try: 
    generate_misc_points(current_date)
    print("success")
except Exception as e:
    print('Error:', e)