import axios from "axios";

export async function getTemperatureReading(data: any) {
    const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/map/temp`,
        {coord: data.coord, date: data.date },
  );


  return res.data

}