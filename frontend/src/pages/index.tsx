import { useEffect, useState } from "react"
import FileCard from "@/components/FileCard"
import { useRouter } from "next/router"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc"

interface FileMeta {
    id: string
    title: string
    description?: string
    uploadDate?: string
}

export default function HomePage() {
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.replace("/login")
        }
    }, [])

    const [files, setFiles] = useState<FileMeta[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchFiles() {
            const token = localStorage.getItem("token")
            const res = await fetch(BACKEND_URL+"/api/files/by-user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            setFiles(data)
            setIsLoading(false)
        }

        fetchFiles()
    }, [])

    const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this file?");
      if (!confirmDelete) return;
      const token = localStorage.getItem("token");
      const res = await fetch(BACKEND_URL+`/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
        toast("File deleted successfully", "success");
      } else {
        toast("Failed to delete file", "error");
      }
    };


    return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Uploaded Files</h1>
        <button onClick={() => router.push("/plot")} className="primary-button">
          Upload New File
        </button>
      </div>
      {isLoading ? (
        <p className="status-message">Loading...</p>
      ) : Array.isArray(files) &&( files.length === 0 ? (
        <p className="status-message">No files uploaded yet.</p>
      ) : (
        <div className="file-grid">
        {files.map((file) => (
          <FileCard key={file.id} 
            id={file.id}
            title={file.title}
            description={file.description}
            onDelete={handleDelete}
            uploadedAt={file.uploadDate} />
        ))}
        </div>
      ))}
    </div>    )
}
