import "../Listings.css";
import Logo from "../images/WarrantyWardenLogo.png";
import { useEffect, useState, useMemo } from "react";
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
  const [sortBy, setSortBy] = useState("none");
  const [sortDir, setSortDir] = useState("asc");
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
      if (formData.manufacturer) fd.append("manufacturer", formData.manufacturer);

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

  const sortedListings = useMemo(() => {
    const arr = [...listings];

    const cmpName = (a, b) => {
      const an = (a.name || "").toString().trim().toLowerCase();
      const bn = (b.name || "").toString().trim().toLowerCase();
      if (an === bn) return 0;
      return an < bn ? -1 : 1;
    };

    const cmpCost = (a, b) => {
      const ac = (a.cost || "").toString().trim().toLowerCase();
      const bc = (b.cost || "").toString().trim().toLowerCase();
      if (ac === bc) return 0;
      return ac < bc ? -1 : 1;
    };

    const cmpDate = (a, b) => {
      // Treat missing/invalid dates as "last"
      const ad = a.expiresAt ? new Date(a.expiresAt) : null;
      const bd = b.expiresAt ? new Date(b.expiresAt) : null;
      const aTime =
        ad && !isNaN(ad.getTime()) ? ad.getTime() : Number.POSITIVE_INFINITY;
      const bTime =
        bd && !isNaN(bd.getTime()) ? bd.getTime() : Number.POSITIVE_INFINITY;
      if (aTime === bTime) return 0;
      return aTime < bTime ? -1 : 1;
    };

    if (sortBy === "name") arr.sort(cmpName);

    if (sortBy === "cost") arr.sort(cmpCost);

    if (sortBy === "expiresAt") arr.sort(cmpDate);

    if (sortDir === "desc") arr.reverse();

    return arr;
  }, [listings, sortBy, sortDir]);

  // show / hide "Back to Top" button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200); // show after 200px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <div className="listings-page">
        <div className="logout-container">
          <button className="logout-btn" onClick={() => navigate("/logout")}>
            Logout
          </button>
        </div>

        <img src={Logo} alt="WarrantyWarden Logo" className="gator-logo"/>
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
                        <div style={{textAlign: "center"}}>
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
                          <p style={{fontSize: "0.8rem", marginTop: "0.3rem"}}>Receipt</p>
                        </div>
                    )}

                {/* Item image preview */}
                {formData.itemImage && (
                    <div style={{textAlign: "center"}}>
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
                      <p style={{fontSize: "0.8rem", marginTop: "0.3rem"}}>Item</p>
                    </div>
                )}
              </div>
          )}

          <div className="submit-container">
            <button type="submit">Add Item</button>
          </div>
        </form>

        <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: "1rem 0",
              flexWrap: "wrap",
            }}
        >
          <label htmlFor="sortBy" style={{fontWeight: 600}}>Sort by:</label>
          <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{padding: "0.35rem 0.5rem"}}
          >
            <option value="none">— None —</option>
            <option value="name">Item Name (A→Z)</option>
            <option value="cost">Manufacturer (A→Z)</option>
            <option value="expiresAt">Expiration Date (Oldest→Newest)</option>
          </select>

          <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Toggle ascending/descending"
              style={{
                padding: "0.4rem 0.75rem",
                border: "1px solid #999",
                borderRadius: 8,
                backgroundColor: "#e0e0e0",
                color: "#222",
                cursor: "pointer",
                fontWeight: 600,
                width: "5.2rem", // fixed width to fit both "↑ Asc" and "↓ Desc"
                textAlign: "center",
                transition: "background-color 0.2s, transform 0.1s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d0d0d0")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>

        <div className="listings-container">
          {sortedListings.map((listing) => (
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
                          <p style={{color: "#ff4d4f", fontWeight: 700}}>
                            Expired on {expiry.toLocaleDateString()}
                          </p>
                      );
                    } else if (diffDays <= 30) {
                      // expiring soon
                      return (
                          <p style={{color: "#ffd54a", fontWeight: 700}}>
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
                            style={{textDecoration: "underline"}}
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
                        <p style={{color: "#ff4d4f", marginTop: "10px"}}>
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

        <footer style={{marginTop: "40px", fontSize: "0.8rem", color: "#777"}}>
          <p>
            © 2025 WarrantyWarden, Inc. All rights reserved. This is a student-built
            demo for the HCI group 4.
          </p>
        </footer>

        {showScrollTop && (
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            style={{
              position: "fixed",
              bottom: "1.5rem",
              right: "1.5rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#FFD700", // same gold as "Add Item"
              color: "black",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "background-color 0.2s, transform 0.1s",
              zIndex: 999,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E6C200")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFD700")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ↑ Top
          </button>
        )}
      </div>
  );
};

export default Listings;
