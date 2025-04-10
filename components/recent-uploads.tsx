import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentUploads = [
  {
    id: "1",
    name: "Customer Service Call #1234",
    date: "2 hours ago",
    status: "Processed",
  },
  {
    id: "2",
    name: "Support Ticket #5678",
    date: "5 hours ago",
    status: "Processed",
  },
  {
    id: "3",
    name: "Sales Call #9012",
    date: "Yesterday",
    status: "Processed",
  },
  {
    id: "4",
    name: "Customer Feedback #3456",
    date: "2 days ago",
    status: "Processed",
  },
  {
    id: "5",
    name: "Team Meeting Recording",
    date: "3 days ago",
    status: "Processed",
  },
]

export function RecentUploads() {
  return (
    <div className="space-y-8">
      {recentUploads.map((upload) => (
        <div key={upload.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/placeholder.svg?text=${upload.id}`} alt="Avatar" />
            <AvatarFallback>{upload.id}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{upload.name}</p>
            <p className="text-sm text-muted-foreground">{upload.date}</p>
          </div>
          <div className="ml-auto font-medium">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              {upload.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
