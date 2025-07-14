import { useState, useRef, useEffect } from "react";
import "../assets/css/Admin.css";

export default function Admin() {
  const [files, setFiles] = useState({ music: null, photo: [], video: null });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef();
  const [price, setPrice] = useState('0');
  const [uploads, setUploads] = useState([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 업로드 리스트 불러오기
  const fetchUploads = () => {
    fetch("http://localhost:5000/api/uploads", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.uploads) setUploads(data.uploads);
      })
      .catch(err => console.error("업로드 리스트 불러오기 실패:", err));
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const onFilesChange = (selectedFiles) => {
    const newFiles = { music: null, photo: [], video: null };
    let invalidFiles = [];

    for (const file of selectedFiles) {
      if (file.type.startsWith("audio/") && !newFiles.music) newFiles.music = file;
      else if (file.type.startsWith("image/")) {
        if (newFiles.photo.length < 10) newFiles.photo.push(file);
        else invalidFiles.push(file.name);
      }
      else if (file.type.startsWith("video/") && !newFiles.video) newFiles.video = file;
      else invalidFiles.push(file.name);
    }

    if (invalidFiles.length > 0) {
      alert(`허용되지 않는 파일 형식:\n${invalidFiles.join(", ")}`);
      return;
    }

    setFiles(newFiles);
  };

  // 업로드
  const handleUpload = () => {
    if (!files.music && files.photo.length === 0 && !files.video) {
      alert("음악, 사진, 비디오 중 하나를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    if (files.music) formData.append("music", files.music);
    files.photo.forEach(photo => formData.append("photo", photo));
    if (files.video) formData.append("video", files.video);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price || '0');

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onloadstart = () => {
      setUploading(true);
      setUploadProgress(0);
      setUploadCompleted(false);
    };

    xhr.onloadend = () => {
      setUploading(false);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadCompleted(true);
          const data = JSON.parse(xhr.responseText);
          setFiles({ music: null, photo: [], video: null });
          setTitle('');
          setDescription('');
          setPrice('0');
          if (data.uploads) setUploads(data.uploads);
          setTimeout(() => {
            setUploadCompleted(false);
            setUploadProgress(0);
          }, 2000);
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            alert(errData.message || "업로드 실패");
          } catch {
            alert("업로드 실패");
          }
          setUploading(false);
          setUploadProgress(0);
          setUploadCompleted(false);
        }
      }
    };

    xhr.open("POST", "http://localhost:5000/api/upload", true);
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    setDeletingId(id);
    setUploading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/uploads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        alert("삭제 완료!");
        setUploads(prev => prev.filter(item => item._id !== id));
      } else {
        alert(data.message || "삭제 실패");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
      setUploading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const getProxyImageUrl = (b2FilePath) => {
    if (!b2FilePath) return '';
    return `http://localhost:5000/api/proxy/b2-thumbnail?file=${encodeURIComponent(b2FilePath)}`;
  };

  const renderThumbnail = (item) => {
    if (item.files?.musicUrl) {
      return <span role="img" aria-label="music">🎵</span>;
    }

    if (item.files?.photoUrls?.length > 0) {
      return (
        <img
          src={getProxyImageUrl(item.files.photoUrls[0])}
          alt={item.title}
          crossOrigin="anonymous"
        />
      );
    }

    if (item.files?.videoThumbnailUrl) {
      return (
        <img
          src={getProxyImageUrl(item.files.videoThumbnailUrl)}
          alt={item.title}
          crossOrigin="anonymous"
        />
      );
    }

    return <span role="img" aria-label="unknown">❓</span>;
  };

  const sortedUploads = [...uploads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const firstGroup = sortedUploads.slice(0, 3);
  const secondGroup = sortedUploads.slice(3, 6);

  return (
    <section id="admin">
      <div className="wrap">
        <h2>관리자</h2>

        <div className="top-container">
          <div
            className="upload-box"
            onClick={() => !uploading && fileInputRef.current.click()}
            onDrop={(e) => {
              e.preventDefault();
              if (!uploading && e.dataTransfer.files?.length) onFilesChange(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>이미지를 최대 10개 끌어다 놓거나 <span>찾아보기</span>로 파일 선택</p>
            {files.music && <p>🎵 음악: {files.music.name}</p>}
            {files.photo.map((photo, i) => <p key={i}>📷 사진: {photo.name}</p>)}
            {files.video && <p>🎬 비디오: {files.video.name}</p>}
            {!files.music && files.photo.length === 0 && !files.video && <p>(최대 50MB)</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,image/*,video/*"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) onFilesChange(e.target.files);
              }}
              disabled={uploading}
            />
          </div>

          <div className="upload-info">
            <ul className="type-list">
              <li className={files.photo.length > 0 ? "active" : ""}>이미지</li>
              <li className={files.video ? "active" : ""}>영상</li>
              <li className={files.music ? "active" : ""}>음악</li>
            </ul>
            <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
              <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} disabled={uploading} />
              <textarea placeholder="설명" rows={4} value={description} onChange={e => setDescription(e.target.value)} disabled={uploading} />
              <input type="number" placeholder="FREE" min="0" step="100" value={price === '0' ? '' : price} onChange={e => setPrice(e.target.value || '0')} disabled={uploading} />
              <button type="submit" disabled={uploading}>업로드</button>
            </form>
          </div>
        </div>

        <div className="bottom-container">
          <h3>최근 업로드</h3>
          <div className="bottom-info">
            {[firstGroup, secondGroup].map((group, groupIndex) => (
              <ul key={groupIndex} className="upload-list">
                <li className="header">
                  <span>썸네일</span>
                  <span>제목</span>
                  <span>유형</span>
                  <span>등록일</span>
                  <span></span>
                </li>
                {group.length > 0 ? group.map(item => (
                  <li key={item._id} className="row">
                    <span className="thumbnail">{renderThumbnail(item)}</span>
                    <span className="title">{item.title}</span>
                    <span className="type">
                      {item.files.musicUrl ? "music" : item.files.photoUrls?.length > 0 ? "photo" : item.files.videoUrl ? "video" : "unknown"}
                    </span>
                    <span className="date">{formatDate(item.createdAt)}</span>
                    <div>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={uploading || deletingId === item._id}
                      >
                        {deletingId === item._id ? "삭제중..." : "삭제"}
                      </button>
                    </div>
                  </li>
                )) : (
                  <li className="row empty">업로드된 항목이 없습니다.</li>
                )}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {(uploading || uploadCompleted) && (
        <div className="upload-modal">
          {uploading && deletingId ? (
            <p>삭제 진행중...</p>
          ) : uploading ? (
            <>
              <p>업로드 진행중... {uploadProgress}%</p>
              <progress value={uploadProgress} max="100" />
            </>
          ) : uploadCompleted && (
            <p>업로드 완료!</p>
          )}
        </div>
      )}
    </section>
  );
}
