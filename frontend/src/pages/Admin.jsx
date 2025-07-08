import { useState, useRef } from "react";
import "../assets/css/Admin.css";

export default function Admin() {
  const [files, setFiles] = useState({ music: null, photo: null, video: null });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef();

  const onFilesChange = (selectedFiles) => {
    const newFiles = { music: null, photo: null, video: null };
    let invalidFiles = [];

    for (const file of selectedFiles) {
      if (file.type.startsWith("audio/") && !newFiles.music) {
        newFiles.music = file;
      } else if (file.type.startsWith("image/") && !newFiles.photo) {
        newFiles.photo = file;
      } else if (file.type.startsWith("video/") && !newFiles.video) {
        newFiles.video = file;
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`허용되지 않는 파일 형식입니다:\n${invalidFiles.join(", ")}`);
      return;
    }

    setFiles(newFiles);
  };

  // 기타 이벤트 핸들러는 동일...

  const handleUpload = async () => {
    if (!files.music && !files.photo && !files.video) {
      alert("음악, 사진, 비디오 중 하나 이상의 파일을 선택해주세요.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    if (files.music) formData.append("music", files.music);
    if (files.photo) formData.append("photo", files.photo);
    if (files.video) formData.append("video", files.video);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await fetch("http://localhost:5000/api/upload-multiple", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert("업로드 성공!");
        setFiles({ music: null, photo: null, video: null });
        setTitle('');
        setDescription('');
      } else {
        alert(data.message || "업로드 실패");
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <section id="admin">
      <div className="wrap">
        <h2>관리자</h2>
        <div className="top-container">
          <div
            className="upload-box"
            onClick={() => fileInputRef.current.click()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFilesChange(e.dataTransfer.files);
                e.dataTransfer.clearData();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p>
              이미지를 최대 10개 끌어다 놓거나 <span>찾아보기</span>로 파일 선택
            </p>

            {files.music && <p>🎵 음악: {files.music.name}</p>}
            {files.photo && <p>📷 사진: {files.photo.name}</p>}
            {files.video && <p>🎬 비디오: {files.video.name}</p>}

            {!files.music && !files.photo && !files.video && (
              <p>(최대 50MB)</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,image/*,video/*"
              multiple
              onChange={e => {
                if (e.target.files.length > 0) {
                  onFilesChange(e.target.files);
                }
              }}
            />
          </div>
          <div className="upload-info">
            <ul className="type-list">
              <li>
                <button
                  type="button"
                  className={files.photo ? "active" : ""}
                  onClick={() => alert(`선택된 이미지 파일: ${files.photo ? files.photo.name : "없음"}`)}
                >
                  이미지
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={files.video ? "active" : ""}
                  onClick={() => alert(`선택된 비디오 파일: ${files.video ? files.video.name : "없음"}`)}
                >
                  영상
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={files.music ? "active" : ""}
                  onClick={() => alert(`선택된 음악 파일: ${files.music ? files.music.name : "없음"}`)}
                >
                  음악
                </button>
              </li>
            </ul>
            <form>
              <input
                type="text"
                placeholder="제목"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                placeholder="설명"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
              <button onClick={handleUpload}>업로드</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
