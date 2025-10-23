import "../Listings.css";
import Logo from "../images/WarrantyWardenLogo.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// images
import hoodieImage from "../images/hoodie.png";
import crocs from "../images/crocs.png";
import alternator from "../images/alternator.png";
import laptop from "../images/laptop.png";
import placeholderlogo from "../images/guarantee-certificate.png";

const Listings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [reportedListings, setReportedListings] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    // NEW
    expiresAt: "",
    attachment: null,
    itemImage: null,
  });

  const [searchTerm, setSearch] = useState("");

  const filteredListings = listings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/listings");
        const data = await res.json();
        console.log("Fetched listings data:", data);
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };

    fetchListings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use FormData so we can include files
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("cost", formData.cost);
      if (formData.expiresAt) fd.append("expiresAt", formData.expiresAt);
      if (formData.attachment) fd.append("attachment", formData.attachment);
      if (formData.itemImage) fd.append("itemImage", formData.itemImage);

      const response = await fetch("http://localhost:3000/api/listings", {
        method: "POST",
        body: fd, // IMPORTANT: no 'Content-Type' header; browser sets it
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorData =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        console.error("Server returned error:", errorData);
        return;
      }

      const newItem = await response.json();
      setListings([...listings, newItem]);
      setFormData({
        name: "",
        description: "",
        cost: "",
        expiresAt: "",
        attachment: null,
        itemImage: null,
      });
    } catch (err) {
      console.error("Error submitting data:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/listings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const errorData =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        console.error("Failed to delete the listing");
        return;
      }

      setListings(listings.filter((listing) => listing._id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const handleReport = (id) => {
    setReportedListings((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <div className="listings-page">
      <div className="logout-container">
        <button className="logout-btn" onClick={() => navigate("/logout")}>
          Logout
        </button>
      </div>

      <img src={Logo} alt="WarrantyWarden Logo" className="gator-logo" />
      <p>All systems secure. The Warden is watching over your assets.</p>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by item name"
          value={searchTerm}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit} className="listing-form">
        <h2>Add a New Item</h2>
        <input
            type="text"
            name="name"
            placeholder="Item name"
            value={formData.name}
            onChange={handleChange}
            required
        />
        <input
            type="text"
            name="description"
            placeholder="Serial number/identifier"
            value={formData.description}
            onChange={handleChange}
            required
        />
        <input
            type="text"
            name="cost"
            placeholder="Manufacturer"
            value={formData.cost}
            onChange={handleChange}
            required
        />

        {/* NEW: Expiration Date */}
        <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
        />

        {/* NEW: Attachment (image or PDF) */}
        <label htmlFor="attachment" style={{alignSelf: "flex-start"}}>Upload receipt (image or PDF)</label>
        <input
            id="attachment"
            type="file"
            name="attachment"
            accept="image/*,application/pdf"
            onChange={(e) =>
                setFormData({
                  ...formData,
                  attachment: e.target.files?.[0] || null,
                })
            }
        />

        {/* Item Image (photo of the product) */}
        <label htmlFor="itemImage" style={{alignSelf: "flex-start"}}>Upload item photo</label>
        <input
            id="itemImage"
            type="file"
            name="itemImage"
            accept="image/*"
            onChange={(e) =>
                setFormData({
                  ...formData,
                  itemImage: e.target.files?.[0] || null,
                })
            }
        />

        {(formData.attachment || formData.itemImage) && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              marginTop: "0.75rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Receipt preview (if it's an image) */}
            {formData.attachment &&
              formData.attachment.type.startsWith("image/") && (
                <div style={{ textAlign: "center" }}>
                  <img
                    alt="receipt preview"
                    style={{
                      maxWidth: 120,
                      borderRadius: 8,
                      opacity: 0.9,
                      border: "1px solid #ccc",
                    }}
                    src={URL.createObjectURL(formData.attachment)}
                  />
                  <p style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Receipt</p>
                </div>
              )}

            {/* Item image preview */}
            {formData.itemImage && (
              <div style={{ textAlign: "center" }}>
                <img
                  alt="item preview"
                  style={{
                    maxWidth: 120,
                    borderRadius: 8,
                    opacity: 0.9,
                    border: "1px solid #ccc",
                  }}
                  src={URL.createObjectURL(formData.itemImage)}
                />
                <p style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Item</p>
              </div>
            )}
          </div>
        )}

        <div className="submit-container">
          <button type="submit">Add Item</button>
        </div>
      </form>

      <div className="listings-container">
        {filteredListings.map((listing) => (
            <div className="listing-item" key={listing._id}>
            <img
              src={
                listing.itemImageUrl
                  ? `http://localhost:3000${listing.itemImageUrl}`
                  : placeholderlogo
              }
              alt={listing.name}
              className="listing-image"
            />
            <div className="listing-info">
              <h2>{listing.name}</h2>
              <p>{listing.description}</p>
              <p className="price">Manufacturer: {listing.cost}</p>

              {/* NEW: Show expiration date if present */}
              {listing.expiresAt && (() => {
  const expiry = new Date(listing.expiresAt);
  const today = new Date();
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    // expired
    return (
      <p style={{ color: "#ff4d4f", fontWeight: 700 }}>
        Expired on {expiry.toLocaleDateString()}
      </p>
    );
  } else if (diffDays <= 30) {
    // expiring soon
    return (
      <p style={{ color: "#ffd54a", fontWeight: 700 }}>
        Expires soon: {expiry.toLocaleDateString()}
      </p>
    );
  } else {
    // active
    return (
      <p>
        Expires: {expiry.toLocaleDateString()}
      </p>
    );
  }
})()}


              {/* NEW: Show attachment link if present */}
              {listing.attachmentUrl && (
                <p>
                  <a
                    href={`http://localhost:3000${listing.attachmentUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    View Receipt
                  </a>
                </p>
              )}

              <div className="button-group">
                <button
                  className="buy-btn"
                  onClick={() => handleDelete(listing._id)}
                >
                  Remove
                </button>
                {reportedListings[listing._id] ? (
                  <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
                    Reported. Thanks for the feedback!
                  </p>
                ) : (
                  <button
                    className="report-btn"
                    onClick={() => handleReport(listing._id)}
                  >
                    Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "40px", fontSize: "0.8rem", color: "#777" }}>
        <p>
          © 2025 WarrantyWarden, Inc. All rights reserved. This is a student-built
          demo for the HCI group 4.
        </p>
      </footer>
    </div>
  );
};

export default Listings;
