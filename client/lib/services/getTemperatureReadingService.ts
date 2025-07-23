import axios from "axios";

export async function getTemperatureReading(data: any) {
    console.log('client side service request getTemperatureReading')
    const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/map/temp`,
        {coord: data.coord, date: data.date },
  );

  console.log("Temperature submission response:", res.data);

  return res.data

}