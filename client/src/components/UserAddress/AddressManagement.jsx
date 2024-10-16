import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteAddressAsync } from '../../redux/address';
import './AddressManagement.css'; // Import CSS file for styles

const AddressManagement = () => {
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState([]); // Initialize state outside of useEffect
  const navigate = useNavigate();

  const deleteAddress = async (address_id) => {  
    try {
      setAddresses((prevAddresses) => prevAddresses.filter(addr => addr._id !== address_id));  
      const result = await dispatch(deleteAddressAsync(address_id));
  
      if (!result.payload.success) {
        const response = await fetch('http://localhost:4000/getaddresses', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
  
      const response = await fetch('http://localhost:4000/getaddresses', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setAddresses(data.addresses || []);
    }
  };
  

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('http://localhost:4000/getaddresses', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("Addresses", data); // Check the structure of the response
        if (Array.isArray(data.addresses)) {
          setAddresses(data.addresses); // Ensure it's an array
        } else {
          setAddresses([]); // Handle unexpected response
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, []);

  return (
    <div className="address-management-container">
      <h1 className="heading">Manage Addresses</h1>
      <p className="sub-heading">
        Here you can manage the addresses. You can add, edit, or delete the addresses.
      </p>

      <button
        onClick={() => navigate('/userprofile/address/add')}
        className="add-address-btn"
      >
        + Add New Address
      </button>

      {addresses.length === 0 ? (
        <div className="no-addresses">No addresses added yet.</div>
      ) : (
        addresses.map((addr, index) => (
          <div key={index} className="address-card">
            {addr.default && <div className="default-label">Default</div>}
            <div>{addr.name}</div>
            <div>{addr.address}</div>
            <div>{addr.city}, {addr.state}</div>
            <div>{addr.pincode}</div>
            <div>Mobile: {addr.mobile}</div>
            <div className="address-actions">
              <button onClick={() => navigate(`/userprofile/address/edit/${addr._id}`)} className="edit-btn">Edit</button>
              <button 
                onClick={() => deleteAddress(addr._id)} 
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AddressManagement;
