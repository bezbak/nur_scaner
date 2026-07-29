import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import { tokenFromQr } from '../lib/api'

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function start() {
      setError('')
      try {
        const reader = new BrowserQRCodeReader()
        controlsRef.current = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          (result) => {
            if (result && !cancelled) {
              cancelled = true
              controlsRef.current?.stop()
              navigate(`/ticket/${encodeURIComponent(tokenFromQr(result.getText()))}`)
            }
          },
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Камера недоступна')
      }
    }
    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [navigate])

  return (
    <div className="page scanner">
      <div className="scanner-frame">
        <video ref={videoRef} muted playsInline />
        <div className="scan-box" />
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="hint">Наведите камеру телефона на QR-код билета</div>
    </div>
  )
}
