import "../Listings.css";
import Logo from "../images/WarrantyWardenLogo.png";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// images
import placeholderlogo from "../images/guarantee-certificate.png";

const Listings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [reportedListings, setReportedListings] = useState({});
  // accordion state: which parent listing ids are expanded
  const [expanded, setExpanded] = useState({});
  // refs to child-listings DOM nodes so we can measure heights
  const childRefs = useRef({});
  const [childHeights, setChildHeights] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    // NEW
    expiresAt: "",
    attachment: null,
    parent: "",
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
      // only include parent if selected
      if (formData.parent) fd.append("parent", formData.parent);

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
        parent: "",
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

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const willOpen = !prev[id];
      // if about to open, measure and store height
      if (willOpen) {
        const el = childRefs.current[id];
        const h = el ? el.scrollHeight : 0;
        setChildHeights((ch) => ({ ...ch, [id]: h }));
      }
      return { ...prev, [id]: willOpen };
    });
  };

  // recompute child heights when listings change or window resizes
  useEffect(() => {
    const recompute = () => {
      const newHeights = {};
      Object.keys(childRefs.current).forEach((id) => {
        const el = childRefs.current[id];
        if (el) newHeights[id] = el.scrollHeight;
      });
      setChildHeights((ch) => ({ ...ch, ...newHeights }));
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [listings]);

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

        {/* NEW: Parent selection - allow grouping under an existing top-level listing */}
        <label htmlFor="parent">Group under (optional):</label>
        <select
          name="parent"
          id="parent"
          value={formData.parent}
          onChange={handleChange}
        >
          <option value="">-- None --</option>
          {/* Only show listings that are top-level (no parent) as possible parents */}
          {listings
            .filter((l) => !l.parent)
            .map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
        </select>

        {/* NEW: Attachment (image or PDF) */}
        <input
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

        <div className="submit-container">
  <button type="submit">Add Item</button>
</div>
      </form>

      <div className="listings-container">
        {/* Group listings by top-level parents. Show parents first, then their children. */}
        {filteredListings
          .filter((l) => !l.parent)
          .map((parentListing) => (
            <div className="listing-group" key={parentListing._id}>
              <div className="listing-item parent-item">
                <img
                  src={placeholderlogo}
                  alt={parentListing.name}
                  className="listing-image"
                />
                <div className="listing-info">
                    <div className="parent-header-row">
                      <h2>{parentListing.name}</h2>
                      <div className="parent-actions">
                        <span className="child-count">{filteredListings.filter((l) => l.parent === parentListing._id).length}</span>
                        <button
                          className={`expand-btn ${expanded[parentListing._id] ? 'open' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleExpanded(parentListing._id); }}
                          aria-expanded={!!expanded[parentListing._id]}
                          title={expanded[parentListing._id] ? 'Collapse' : 'Expand'}
                        >
                          <span className="chev">▾</span>
                        </button>
                      </div>
                    </div>
                  <p>{parentListing.description}</p>
                  <p className="price">Manufacturer: {parentListing.cost}</p>

                  {parentListing.expiresAt && (() => {
                    const expiry = new Date(parentListing.expiresAt);
                    const today = new Date();
                    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

                    if (diffDays < 0) {
                      return (
                        <p style={{ color: "#ff4d4f", fontWeight: 700 }}>
                          Expired on {expiry.toLocaleDateString()}
                        </p>
                      );
                    } else if (diffDays <= 30) {
                      return (
                        <p style={{ color: "#ffd54a", fontWeight: 700 }}>
                          Expires soon: {expiry.toLocaleDateString()}
                        </p>
                      );
                    } else {
                      return <p>Expires: {expiry.toLocaleDateString()}</p>;
                    }
                  })()}

                  {parentListing.attachmentUrl && (
                    <p>
                      <a
                        href={`http://localhost:3000${parentListing.attachmentUrl}`}
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
                      onClick={() => handleDelete(parentListing._id)}
                    >
                      Remove
                    </button>
                    {reportedListings[parentListing._id] ? (
                      <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
                        Reported. Thanks for the feedback!
                      </p>
                    ) : (
                      <button
                        className="report-btn"
                        onClick={() => handleReport(parentListing._id)}
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Render child listings under this parent */}
              <div
                ref={(el) => { if (el) childRefs.current[parentListing._id] = el }}
                className={`child-listings ${expanded[parentListing._id] ? 'open' : 'closed'}`}
                style={{ maxHeight: expanded[parentListing._id] ? (childHeights[parentListing._id] ? `${childHeights[parentListing._id]}px` : '800px') : '0' }}
              >
                {filteredListings
                  .filter((l) => l.parent === parentListing._id)
                  .map((child) => (
                    <div className="listing-item child-item" key={child._id}>
                      <img
                        src={placeholderlogo}
                        alt={child.name}
                        className="listing-image"
                      />
                      <div className="listing-info">
                        <h3>{child.name}</h3>
                        <p>{child.description}</p>
                        <p className="price">Manufacturer: {child.cost}</p>

                        {child.expiresAt && (() => {
                          const expiry = new Date(child.expiresAt);
                          const today = new Date();
                          const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

                          if (diffDays < 0) {
                            return (
                              <p style={{ color: "#ff4d4f", fontWeight: 700 }}>
                                Expired on {expiry.toLocaleDateString()}
                              </p>
                            );
                          } else if (diffDays <= 30) {
                            return (
                              <p style={{ color: "#ffd54a", fontWeight: 700 }}>
                                Expires soon: {expiry.toLocaleDateString()}
                              </p>
                            );
                          } else {
                            return <p>Expires: {expiry.toLocaleDateString()}</p>;
                          }
                        })()}

                        {child.attachmentUrl && (
                          <p>
                            <a
                              href={`http://localhost:3000${child.attachmentUrl}`}
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
                            onClick={() => handleDelete(child._id)}
                          >
                            Remove
                          </button>
                          {reportedListings[child._id] ? (
                            <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
                              Reported. Thanks for the feedback!
                            </p>
                          ) : (
                            <button
                              className="report-btn"
                              onClick={() => handleReport(child._id)}
                            >
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        {/* Render any listings that are top-level but filtered out earlier (if they have a parent that isn't in the filtered list), or orphan children */}
        {filteredListings
          .filter((l) => l.parent && !filteredListings.find((p) => p._id === l.parent))
          .map((orphan) => (
            <div className="listing-item" key={orphan._id}>
              <img src={placeholderlogo} alt={orphan.name} className="listing-image" />
              <div className="listing-info">
                <h2>{orphan.name}</h2>
                <p>{orphan.description}</p>
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
