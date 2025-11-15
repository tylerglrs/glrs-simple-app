// ============================================================
// GLRS LIGHTHOUSE - IMAGE MODAL
// ============================================================
// Full-screen image viewer modal
// Part of modular architecture - modal components
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = window.GLRSApp.modals || {};

// Image Modal Component - Full-screen image viewer
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                cursor: 'pointer'
            }}
        >
            <img
                src={imageUrl}
                style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain'
                }}
                onClick={(e) => e.stopPropagation()}
            />
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '30px',
                    cursor: 'pointer'
                }}
            >
                ✕
            </button>
        </div>
    );
};

// Expose to global namespace
window.GLRSApp.modals.ImageModal = ImageModal;

// Backward compatibility
window.ImageModal = ImageModal;

