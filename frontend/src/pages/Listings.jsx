import "../Listings.css";
import Logo from "../images/WarrantyWardenLogo.png";
import { useEffect, useState, useRef, useMemo } from "react";
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

  // sorting helpers
  const [sortBy, setSortBy] = useState("none");
  const [sortDir, setSortDir] = useState("asc");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    expiresAt: "",
    attachment: null,
    itemImage: null,
    parent: "",
  });

  const [searchTerm, setSearch] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/listings");
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };

    fetchListings();
  }, []);

  const sortedListings = useMemo(() => {
    const arr = [...listings];
    const cmpName = (a, b) => (a.name || "").localeCompare(b.name || "");
    const cmpCost = (a, b) => (a.cost || "").toString().localeCompare((b.cost || "").toString());
    const cmpDate = (a, b) => {
      const at = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
      const bt = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
      return at - bt;
    };

    if (sortBy === "name") arr.sort(cmpName);
    if (sortBy === "cost") arr.sort(cmpCost);
    if (sortBy === "expiresAt") arr.sort(cmpDate);
    if (sortDir === "desc") arr.reverse();
    return arr;
  }, [listings, sortBy, sortDir]);

  const filteredListings = sortedListings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("cost", formData.cost);
      if (formData.expiresAt) fd.append("expiresAt", formData.expiresAt);
      if (formData.parent) fd.append("parent", formData.parent);
      if (formData.attachment) fd.append("attachment", formData.attachment);
      if (formData.itemImage) fd.append("itemImage", formData.itemImage);

      const response = await fetch("http://localhost:3000/api/listings", {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const errorData = contentType && contentType.includes("application/json") ? await response.json() : await response.text();
        console.error("Server returned error:", errorData);
        return;
      }

      const newItem = await response.json();
      setListings((prev) => [...prev, newItem]);
      setFormData({ name: "", description: "", cost: "", expiresAt: "", attachment: null, itemImage: null, parent: "" });
    } catch (err) {
      console.error("Error submitting data:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/listings/${id}`, { method: "DELETE" });
      if (!response.ok) {
        console.error("Failed to delete the listing");
        return;
      }
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const handleReport = (id) => setReportedListings((p) => ({ ...p, [id]: true }));

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const willOpen = !prev[id];
      if (willOpen) {
        const el = childRefs.current[id];
        const h = el ? el.scrollHeight : 0;
        setChildHeights((ch) => ({ ...ch, [id]: h }));
      }
      return { ...prev, [id]: willOpen };
    });
  };

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

  // group parents (top-level) from filtered listings
  const parentListings = filteredListings.filter((l) => !l.parent);

  return (
    <div className="listings-page">
      <div className="logout-container">
        <button className="logout-btn" onClick={() => navigate("/logout")}>Logout</button>
      </div>

      <img src={Logo} alt="WarrantyWarden Logo" className="gator-logo" />
      <p>All systems secure. The Warden is watching over your assets.</p>

      <div className="search-bar-container">
        <input type="text" placeholder="Search by item name" value={searchTerm} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit} className="listing-form">
        <h2>Add a New Item</h2>
        <input type="text" name="name" placeholder="Item name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Serial number/identifier" value={formData.description} onChange={handleChange} required />
        <input type="text" name="cost" placeholder="Manufacturer" value={formData.cost} onChange={handleChange} required />

        <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} />

        <label htmlFor="parent">Group under (optional):</label>
        <select name="parent" id="parent" value={formData.parent} onChange={handleChange}>
          <option value="">-- None --</option>
          {listings.filter((l) => !l.parent).map((l) => (
            <option key={l._id} value={l._id}>{l.name}</option>
          ))}
        </select>

        <label htmlFor="attachment" style={{ alignSelf: "flex-start" }}>Upload receipt (image or PDF)</label>
        <input id="attachment" type="file" name="attachment" accept="image/*,application/pdf" onChange={(e) => setFormData((f) => ({ ...f, attachment: e.target.files?.[0] || null }))} />

        <label htmlFor="itemImage" style={{ alignSelf: "flex-start" }}>Upload item photo</label>
        <input id="itemImage" type="file" name="itemImage" accept="image/*" onChange={(e) => setFormData((f) => ({ ...f, itemImage: e.target.files?.[0] || null }))} />

        {(formData.attachment || formData.itemImage) && (
          <div style={{ display: "flex", flexDirection: "row", gap: "1rem", marginTop: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {formData.attachment && formData.attachment.type.startsWith("image/") && (
              <div style={{ textAlign: "center" }}>
                <img alt="receipt preview" style={{ maxWidth: 120, borderRadius: 8, opacity: 0.9, border: "1px solid #ccc" }} src={URL.createObjectURL(formData.attachment)} />
                <p style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Receipt</p>
              </div>
            )}
            {formData.itemImage && (
              <div style={{ textAlign: "center" }}>
                <img alt="item preview" style={{ maxWidth: 120, borderRadius: 8, opacity: 0.9, border: "1px solid #ccc" }} src={URL.createObjectURL(formData.itemImage)} />
                <p style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Item</p>
              </div>
            )}
          </div>
        )}

        <div className="submit-container"><button type="submit">Add Item</button></div>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "1rem 0", flexWrap: "wrap" }}>
        <label htmlFor="sortBy" style={{ fontWeight: 600 }}>Sort by:</label>
        <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "0.35rem 0.5rem" }}>
          <option value="none"> None </option>
          <option value="name">Item Name (AZ)</option>
          <option value="cost">Manufacturer (AZ)</option>
          <option value="expiresAt">Expiration Date (OldestNewest)</option>
        </select>
        <button type="button" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} title="Toggle ascending/descending" style={{ padding: "0.4rem 0.75rem", border: "1px solid #999", borderRadius: 8, backgroundColor: "#e0e0e0", color: "#222", cursor: "pointer", fontWeight: 600, width: "5.2rem", textAlign: "center" }}>{sortDir === "asc" ? " Asc" : " Desc"}</button>
      </div>

      <div className="listings-container">
        {parentListings.map((parentListing) => (
          <div className="listing-group" key={parentListing._id}>
            <div className="listing-item parent-item">
              <img src={parentListing.itemImageUrl ? `http://localhost:3000${parentListing.itemImageUrl}` : placeholderlogo} alt={parentListing.name} className="listing-image" />
              <div className="listing-info">
                <div className="parent-header-row">
                  <h2>{parentListing.name}</h2>
                  <div className="parent-actions">
                    <span className="child-count">{filteredListings.filter((l) => l.parent === parentListing._id).length}</span>
                    <button className={`expand-btn ${expanded[parentListing._id] ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); toggleExpanded(parentListing._id); }} aria-expanded={!!expanded[parentListing._id]} title={expanded[parentListing._id] ? 'Collapse' : 'Expand'}>
                      <span className="chev"></span>
                    </button>
                  </div>
                </div>
                <p>{parentListing.description}</p>
                <p className="price">Manufacturer: {parentListing.cost}</p>
                {parentListing.expiresAt && (() => {
                  const expiry = new Date(parentListing.expiresAt);
                  const today = new Date();
                  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
                  if (diffDays < 0) return (<p style={{ color: "#ff4d4f", fontWeight: 700 }}>Expired on {expiry.toLocaleDateString()}</p>);
                  if (diffDays <= 30) return (<p style={{ color: "#ffd54a", fontWeight: 700 }}>Expires soon: {expiry.toLocaleDateString()}</p>);
                  return <p>Expires: {expiry.toLocaleDateString()}</p>;
                })()}
                {parentListing.attachmentUrl && (<p><a href={`http://localhost:3000${parentListing.attachmentUrl}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>View Receipt</a></p>)}
                <div className="button-group">
                  <button className="buy-btn" onClick={() => handleDelete(parentListing._id)}>Remove</button>
                  {reportedListings[parentListing._id] ? (<p style={{ color: "#ff4d4f", marginTop: "10px" }}>Reported. Thanks for the feedback!</p>) : (<button className="report-btn" onClick={() => handleReport(parentListing._id)}>Report</button>)}
                </div>
              </div>
            </div>

            <div ref={(el) => { if (el) childRefs.current[parentListing._id] = el }} className={`child-listings ${expanded[parentListing._id] ? 'open' : 'closed'}`} style={{ maxHeight: expanded[parentListing._id] ? (childHeights[parentListing._id] ? `${childHeights[parentListing._id]}px` : '800px') : '0' }}>
              {filteredListings.filter((l) => l.parent === parentListing._id).map((child) => (
                <div className="listing-item child-item" key={child._id}>
                  <img src={child.itemImageUrl ? `http://localhost:3000${child.itemImageUrl}` : placeholderlogo} alt={child.name} className="listing-image" />
                  <div className="listing-info">
                    <h3>{child.name}</h3>
                    <p>{child.description}</p>
                    <p className="price">Manufacturer: {child.cost}</p>
                    {child.expiresAt && (() => {
                      const expiry = new Date(child.expiresAt);
                      const today = new Date();
                      const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
                      if (diffDays < 0) return (<p style={{ color: "#ff4d4f", fontWeight: 700 }}>Expired on {expiry.toLocaleDateString()}</p>);
                      if (diffDays <= 30) return (<p style={{ color: "#ffd54a", fontWeight: 700 }}>Expires soon: {expiry.toLocaleDateString()}</p>);
                      return <p>Expires: {expiry.toLocaleDateString()}</p>;
                    })()}
                    {child.attachmentUrl && (<p><a href={`http://localhost:3000${child.attachmentUrl}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>View Receipt</a></p>)}
                    <div className="button-group">
                      <button className="buy-btn" onClick={() => handleDelete(child._id)}>Remove</button>
                      {reportedListings[child._id] ? (<p style={{ color: "#ff4d4f", marginTop: "10px" }}>Reported. Thanks for the feedback!</p>) : (<button className="report-btn" onClick={() => handleReport(child._id)}>Report</button>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* orphan children or listings with parents not in filtered list */}
        {filteredListings.filter((l) => l.parent && !filteredListings.find((p) => p._id === l.parent)).map((orphan) => (
          <div className="listing-item" key={orphan._id}>
            <img src={orphan.itemImageUrl ? `http://localhost:3000${orphan.itemImageUrl}` : placeholderlogo} alt={orphan.name} className="listing-image" />
            <div className="listing-info"><h2>{orphan.name}</h2><p>{orphan.description}</p></div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "40px", fontSize: "0.8rem", color: "#777" }}>
        <p> 2025 WarrantyWarden, Inc. All rights reserved. This is a student-built demo for the HCI group 4.</p>
      </footer>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "0.6rem 1.2rem", backgroundColor: "#FFD700", color: "black", border: "none", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem", zIndex: 999 }}> Top</button>
      )}
    </div>
  );
};

export default Listings;
