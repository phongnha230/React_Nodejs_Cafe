import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useProductStore } from "../../stores/productStore"
import { useAuthStore } from "../../stores/authStore"

const ReviewMedia = ({ url }) => {
  if (!url) return null;
  const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes("video");
  
  if (isVideo) {
    return (
      <div className="review-media-container" style={{ marginTop: "10px" }}>
        <video src={url} controls style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "300px" }} />
      </div>
    );
  }
  
  return (
    <div className="review-media-container" style={{ marginTop: "10px" }}>
      <img src={url} alt="Review" style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "300px", objectFit: "cover" }} />
    </div>
  );
};

const getReviewCustomerName = (review = {}) => (
  review.customer_name ||
  review.customerName ||
  review.userName ||
  review.User?.username ||
  review.user?.username ||
  'Khách hàng'
);

export default function ProductReviewsPage() {
  const { id } = useParams()
  const { currentProduct, loadFromAPI, reviews, loading, removeReview } = useProductStore()
  const { user } = useAuthStore()
  const role = user?.role

  useEffect(() => {
    loadFromAPI(id)
  }, [id, loadFromAPI])

  if (loading && !currentProduct) return <div className="loading">Đang tải...</div>
  if (!currentProduct) return <div className="error">Không tìm thấy sản phẩm</div>

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/menu" className="btn secondary">← Quay lại thực đơn</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
        {currentProduct.image_url && (
          <img 
            src={currentProduct.image_url} 
            alt={currentProduct.name} 
            style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover" }}
          />
        )}
        <div>
          <h1 style={{ margin: 0 }}>Đánh giá cho: {currentProduct.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <span style={{ color: "#f59e0b", fontSize: "20px" }}>
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span style={{ color: "#6b7280" }}>{reviews.length} đánh giá</span>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "30px 0" }} />

      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "12px" }}>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Chưa có đánh giá nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ 
              padding: "20px", 
              border: "1px solid #e5e7eb", 
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "16px", color: "#111827" }}>
                  {getReviewCustomerName(r)}
                </div>
                <div style={{ color: "#f59e0b", margin: "4px 0" }}>
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <div style={{ color: "#374151", lineHeight: 1.5, marginTop: "8px" }}>
                  {r.comment || (
                    <span style={{ color: "#9ca3af", fontStyle: "italic" }}>(Không có nội dung)</span>
                  )}
                </div>
                <ReviewMedia url={r.media_url || r.mediaUrl} />
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
                  {new Date(r.created_at || r.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
              
              {role === "admin" && (
                <button
                  className="btn secondary"
                  style={{ color: "#ef4444", borderColor: "#fee2e2", fontSize: "13px" }}
                  onClick={async () => {
                    if (confirm("Xóa đánh giá này?")) {
                      await removeReview(r.id)
                    }
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
