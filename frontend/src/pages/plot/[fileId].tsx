import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc"


const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })
export default function ViewPlotPage() {
    const [Plotly, setPlotly] = useState<any>(null);
    useEffect(() => {
    if (typeof window === 'undefined') return;  //So it does not run in server side
    import('plotly.js-dist')
      .then((mod) => setPlotly(mod.default))
      .catch((err) => {
        console.error("Failed to load Plotly:", err);
      });
  }, []);

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
        }
    }, [])

    const router = useRouter()
    const { fileId } = router.query

    const [dataSet, setDataSet] = useState<number[][]>([])
    const [columns, setColumns] = useState<string[]>([])
    const [plotName, setPlotName] = useState<string>("")
    const [xAxis, setXAxis] = useState(0)
    const [yAxis, setYAxis] = useState(1)
    const [color, setColor] = useState("#ff0000")
    const [isLoading, setIsLoading] = useState(true)
    const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp' | 'full-json'>('png');
    const [plotMode, setPlotMode] = useState("markers");

    useEffect(() => {
        if (!fileId) return

        async function fetchFile() {
            const token = localStorage.getItem("token")
            const res = await fetch(BACKEND_URL+`/api/download/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!res.ok) {
                if (res.status === 403) {
                    toast("You are not authorized to access this file.", "error")
                    router.push("/plot")
                } else if (res.status === 404) {
                    toast("File not found.", "error")
                } else {
                    toast("Something went wrong while loading the file.", "error")
                }
                return
            }

            const result = await res.json()
            setDataSet(result.data)
            setColumns(result.columns)
            setPlotName(result.metadata?.title || "Untitled")
            setXAxis(0)
            setYAxis(1)
            setIsLoading(false)
        }

        fetchFile()
    }, [fileId])

    if (isLoading) return <div className="loading">Loading…</div>

    const plotWidth = Math.min(800, window.innerWidth* 10/11)
    const layout = { width: plotWidth, height: Math.max(plotWidth*3/4, 300), title: plotName };


    return (
         <div className="plot-page">
      <h1>{plotName}</h1>

      {isLoading ? (
        <p className="status-message">Loading plot data...</p>
      ) : (
        <>
          <div className="plot-controls">
            <label>
              X-Axis:
              <select value={xAxis} onChange={(e) => setXAxis(Number(e.target.value))}>
                {columns.map((col, i) => (
                  <option value={i} key={`x-${i}`}>
                    {col}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Y-Axis:
              <select value={yAxis} onChange={(e) => setYAxis(Number(e.target.value))}>
                {columns.map((col, i) => (
                  <option value={i} key={`y-${i}`}>
                    {col}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Color:
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>

            <button onClick={() => setPlotMode(plotMode === "markers" ? "lines+markers" : "markers")}>
              {plotMode === "markers" ? "Show lines" : " Hide  lines"}
            </button>

          </div>

          <Plot
            data={[
              {
                x: dataSet.map((row) => row[xAxis]),
                y: dataSet.map((row) => row[yAxis]),
                type: "scatter",
                mode: plotMode,
                marker: { color },
              },
            ]}
            layout={layout}
          />

          <div className="download-controls">
          <label>
            Download Format:
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
              <option value="full-json">JSON</option>
            </select>
          </label>

          <button
            onClick={() => {
              const plotImg = document.querySelector(".js-plotly-plot") as any;
              if (plotImg) {
                Plotly.downloadImage(plotImg, {
                  format: exportFormat,
                  filename: plotName || "plot",
                  width: 800,
                  height: 500,
                });
              }
            }}
            className="primary-button"
          >
            Download as {exportFormat.toUpperCase()}
          </button>
        </div>

        </>
      )}
    </div>
    )
}
