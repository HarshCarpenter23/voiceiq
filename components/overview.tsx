"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    uploads: 12,
    reports: 10,
  },
  {
    name: "Feb",
    uploads: 8,
    reports: 7,
  },
  {
    name: "Mar",
    uploads: 15,
    reports: 14,
  },
  {
    name: "Apr",
    uploads: 18,
    reports: 16,
  },
  {
    name: "May",
    uploads: 10,
    reports: 9,
  },
  {
    name: "Jun",
    uploads: 22,
    reports: 20,
  },
  {
    name: "Jul",
    uploads: 24,
    reports: 18,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="uploads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="reports" fill="hsl(var(--primary)/0.3)" radius={[4, 4, 0, 0]} className="fill-primary/30" />
      </BarChart>
    </ResponsiveContainer>
  )
}
