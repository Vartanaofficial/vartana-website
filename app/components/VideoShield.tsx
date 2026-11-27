import './video-shield.css';

// Sits over Google Drive's "open in new window" button so viewers stay on the VARTANA page.
export default function VideoShield() {
  return <span className="vt-video-shield" aria-hidden="true" onContextMenu={e => e.preventDefault()}>
    <img src="/Logo%20Vartana%20Bulat.png" alt="" width="30" height="30" draggable={false}/>
  </span>;
}
