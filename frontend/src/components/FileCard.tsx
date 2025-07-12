import Link from "next/link"

interface FileCardProps {
    id: string
    title: string
    description?: string
    onDelete?: (id: string) => void
    uploadedAt: string;
}

export default function FileCard({ id, title, description, onDelete, uploadedAt }: FileCardProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(timeZone);
  // console.log(uploadedAt)
  // console.log(new Date(uploadedAt).toString())

    return (
    <div className="file-card">
      <h2 className="file-title">{title}</h2>
      <p className={`file-description ${description ? "" : "muted"}`}>
        {description || "No description"}
      </p>

      <p className="file-timestamp">
        Uploaded on: {new Date(uploadedAt+"Z").toString()}
    </p>

      <div className="file-actions">
        <Link href={`/plot/${id}`} className="view-link">View
        </Link>

        {onDelete && (
          <button className="delete-btn" onClick={() => onDelete(id)}>
            Delete
          </button>
        )}
      </div>
    </div>
    )
}
