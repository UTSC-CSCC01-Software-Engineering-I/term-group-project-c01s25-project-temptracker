import axios from "axios";

export async function getMapContours(data:any) {
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/map-visual/fetch-contours`,
        {date: data.date, today: data.today, currentHour: data.currentHour, timeRange: data.timeRange },
    )
    return res.data
}