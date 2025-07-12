import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc"

export default function UploadPlotPage() {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
        }
    }, [router])

    const [formData, setFormData] = useState({
        file: null,
        title: "",
        description: "",
        hasHeaders: true,
        defaultValue: null
    })

    const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type, value, checked, files } = e.target as HTMLInputElement
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked })
        } else if (type === "file") {
            setFormData({ ...formData, [name]: files?.[0] || null })
        } else if (type === "number") {
            setFormData({ ...formData, [name]: value ==="" ? null : Number(value)})
        }
        else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { file, title, description, hasHeaders, defaultValue } = formData
        if (!file) return toast("Please select a file", "warning")

        const body = new FormData()
        body.append("file", file)
        body.append("title", title)
        body.append("description", description)
        body.append("hasHeaders", String(hasHeaders))
        body.append("defaultValue", String(defaultValue))
        console.table(body)

        setIsUploading(true)

        const token = localStorage.getItem("token")

        const res = await fetch(BACKEND_URL+"/api/upload", {
            method: "POST",
            body,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const result = await res.json()
        // console.log(result)
        // console.log(res)
        if (res.status == 400){
            toast(result.detail, "error")
        }
        else{
            setUploadedFileId(result.file_id)
            setFormData({
                file: null,
                title: "",
                description: "",
                hasHeaders: true,
                defaultValue: null
            });
        }
        setIsUploading(false)
    }

    return (
        <div className="upload-container">
      <form className="upload-form" onSubmit={handleSubmit}>
        <h1>Upload CSV File</h1>

        <label htmlFor="file">Select File</label>
        <input type="file" name="file" accept=".csv" onChange={handleChange} required />

        <label htmlFor="title">Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label htmlFor="description">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />

        <label className="checkbox-label">
          <input type="checkbox" name="hasHeaders" checked={formData.hasHeaders} onChange={handleChange} />
          File has headers
        </label>

        <label className="form-label">
        Default value for missing cells (optional):
        <input
            type="number"
            name="defaultValue"
            placeholder="Leave blank to reject invalid rows"
            onChange={handleChange}
            className="form-input"
        />
        </label>

        <button type="submit" className="primary-button" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {uploadedFileId && (
            <div className="plot-link">
            <button
            type="button"
            onClick={() => router.push(`/plot/${uploadedFileId}`)}
            className="primary-button"
            >
            Plot the uploaded file
            </button>
        </div>
        )}
    </form>
    </div>

    )
}
