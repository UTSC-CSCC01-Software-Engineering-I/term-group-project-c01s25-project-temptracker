import axios from "axios";

export type ChartPoint = {
  temperature: number,
  date: string
}

export async function getTemperatureReading(data: any) {
    const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/map/temp`,
        {coord: data.coord, date: data.date, hour: data.hour },
  );


  return res.data

}

export async function lakeClicked(data: any) {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/map/clicked_lake`,
        {coord: data.coord, date: data.date, hour: data.hour },
    )

    return res.data
}

export async function getChartData(data: any) {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/map/chart`,
        {lake: data },
  )

  return res.data
}

export async function checkWaterBodies() {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/map/script`,
  )

  return res.data
}