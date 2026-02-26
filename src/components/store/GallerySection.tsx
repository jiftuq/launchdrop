import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GallerySectionProps {
  gallery: {
    enabled: boolean;
    title: string;
    images: string[];
  };
  colors: any;
  fonts: any;
  theme: string;
}

export default function GallerySection({
  gallery,
  colors,
  fonts,
  theme,
}: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!gallery.enabled || !gallery.images?.length) return null;

  const themeStyles = getThemeStyles(theme);

  return (
    <section style={{ padding: "80px 0" }}>
      <div style={styles.container}>
        <h2
          style={{
            ...styles.sectionTitle,
            fontFamily: `'${fonts.heading}', ${themeStyles.headingFallback}`,
            color: colors.text,
          }}
        >
          {gallery.title}
        </h2>

        <div style={styles.galleryGrid}>
          {gallery.images.map((img, i) => (
            <div
              key={i}
              style={{
                ...styles.imageWrapper,
                borderRadius: themeStyles.borderRadius,
              }}
              onClick={() => setSelectedImage(i)}
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                style={{
                  ...styles.image,
                  borderRadius: themeStyles.borderRadius,
                }}
              />
              <div
                style={{
                  ...styles.imageOverlay,
                  borderRadius: themeStyles.borderRadius,
                }}
              >
                <span style={styles.viewText}>View</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <button
            style={{ ...styles.lightboxClose }}
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <button
            style={{ ...styles.lightboxNav, left: 20 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((i) =>
                i === 0 ? gallery.images.length - 1 : (i as number) - 1
              );
            }}
          >
            <ChevronLeft size={32} />
          </button>
          <img
            src={gallery.images[selectedImage]}
            alt={`Gallery ${selectedImage + 1}`}
            style={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{ ...styles.lightboxNav, right: 20 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((i) =>
                i === gallery.images.length - 1 ? 0 : (i as number) + 1
              );
            }}
          >
            <ChevronRight size={32} />
          </button>
          <div style={styles.lightboxCounter}>
            {selectedImage + 1} / {gallery.images.length}
          </div>
        </div>
      )}
    </section>
  );
}

function getThemeStyles(theme: string) {
  switch (theme) {
    case "luxury":
      return { headingFallback: "serif", borderRadius: 4 };
    case "playful":
      return { headingFallback: "sans-serif", borderRadius: 20 };
    case "bold":
      return { headingFallback: "sans-serif", borderRadius: 12 };
    default:
      return { headingFallback: "sans-serif", borderRadius: 12 };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 24px",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 48,
    letterSpacing: "-0.02em",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },
  imageWrapper: {
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    aspectRatio: "4/3",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
  },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  viewText: {
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    padding: "8px 20px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.95)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: 12,
    borderRadius: "50%",
    cursor: "pointer",
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: 12,
    borderRadius: "50%",
    cursor: "pointer",
  },
  lightboxImage: {
    maxWidth: "90%",
    maxHeight: "80vh",
    objectFit: "contain",
    borderRadius: 8,
  },
  lightboxCounter: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    fontSize: "0.9rem",
    background: "rgba(255,255,255,0.1)",
    padding: "8px 16px",
    borderRadius: 20,
  },
};
