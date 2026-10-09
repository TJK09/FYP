import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import "../../styles/pages/Depressionanalysis.css";

const DepressionAnalysis = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const [result, setResult] = useState("");
  const [reportLink, setReportLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [mlToken, setMlToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("ml_token");
    if (token) setMlToken(token);
  }, []);

  // Convert recorded audio to WAV format
  const convertToWav = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = decodedBuffer.numberOfChannels;
    const sampleRate = decodedBuffer.sampleRate;
    const bitsPerSample = 16;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataLength = decodedBuffer.length * blockAlign;

    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // Helper to write ASCII strings
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    const channelData = [];
    for (let i = 0; i < numChannels; i++) channelData.push(decodedBuffer.getChannelData(i));

    let offset = 44;
    for (let i = 0; i < decodedBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = Math.max(-1, Math.min(1, channelData[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const wavBlob = await convertToWav(blob);
        const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });
        setAudioFile(file);
        if (audioRef.current) audioRef.current.src = URL.createObjectURL(wavBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied or not supported.");
      console.error(err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Handle file upload from computer
  const handleFileChange = (e) => setAudioFile(e.target.files[0]);

  // Submit audio to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return alert("Please record or upload an audio file first!");
    if (!mlToken) return alert("❌ Book the lab test first to get a token.");

    setLoading(true);
    setResult("");
    setReportLink("");

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("token", mlToken);

      const accessToken = localStorage.getItem("access_token"); // JWT
      const response = await fetch("http://127.0.0.1:8000/api/depression/submit/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
        credentials: "omit", // Avoid CSRF issues
      });

      if (!response.ok) throw new Error("Failed to submit test");
      const data = await response.json();
      setResult(`${data.result} (Confidence: ${(data.probability * 100).toFixed(2)}%)`);
      setReportLink(data.report_link);
    } catch (error) {
      console.error(error);
      setResult("Error occurred while submitting the test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="depression-page">
      <Card className="depression-form">
        <h3 className="mb-4 text-center">Depression Analysis Evaluation</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Upload your audio recording</Form.Label>
            <Form.Control
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={recording}
            />
          </Form.Group>

          <div className="mb-3 text-center">
            {!recording ? (
              <Button variant="secondary" onClick={startRecording}>
                🎤 Start Recording
              </Button>
            ) : (
              <Button variant="danger" onClick={stopRecording}>
                ⏹ Stop Recording
              </Button>
            )}
          </div>

          {audioFile && (
            <div className="mb-3 text-center">
              <audio ref={audioRef} controls />
            </div>
          )}

          <div className="text-center">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Analyze Depression"}
            </Button>
          </div>
        </Form>

        {result && (
          <Alert variant={result.includes("Error") ? "danger" : "warning"} className="mt-4 text-center">
            <strong>Result:</strong> {result} <br />
            {reportLink && (
              <a
                href={reportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success mt-2"
              >
                ⬇️ View / Download PDF Report
              </a>
            )}
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default DepressionAnalysis;
