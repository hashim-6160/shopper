import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2'; // Import SweetAlert
import { updateAddressAsync } from '../../redux/address';
import './EditAddress.css';

const EditAddress = () => {
  const { id } = useParams(); // Get the address ID from the route parameters
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    addressType: '',
    landmark: '',
    mobile: '',
    email: '',
    alternate: '',
  });

  const [errors, setErrors] = useState({}); // State to hold validation errors

  useEffect(() => {
    // Fetch the address details by ID and pre-fill the form
    const fetchAddressById = async () => {
      const response = await fetch(`http://localhost:4000/getaddress/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'user-info': `${localStorage.getItem('user-info')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFormData(data.address); // Pre-fill form data with fetched address details
      }
    };

    fetchAddressById();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Trim whitespace from input values
    const trimmedData = {
      ...formData,
      name: formData.name.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
      landmark: formData.landmark.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      alternate: formData.alternate.trim(),
    };

    // Validate name
    if (!trimmedData.name) {
      newErrors.name = "Name is required";
    }

    // Validate city
    if (!trimmedData.city) {
      newErrors.city = "City is required";
    }

    // Validate state
    if (!trimmedData.state) {
      newErrors.state = "State is required";
    }

    // Validate address
    if (!trimmedData.address) {
      newErrors.address = "Address is required";
    }

    // Validate pincode
    const pincodePattern = /^[0-9]{6}$/; // Assuming Indian pincode format (6 digits)
    if (!trimmedData.pincode) {
      newErrors.pincode = "Pin Code is required";
    } else if (!pincodePattern.test(trimmedData.pincode)) {
      newErrors.pincode = "Invalid Pin Code format. Must be 6 digits.";
    }

    // Validate mobile
    const mobilePattern = /^[0-9]{10}$/; // 10 digits for mobile number
    if (!trimmedData.mobile) {
      newErrors.mobile = "Mobile Number is required";
    } else if (!mobilePattern.test(trimmedData.mobile)) {
      newErrors.mobile = "Invalid Mobile Number format. Must be 10 digits.";
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    if (!trimmedData.email) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(trimmedData.email)) {
      newErrors.email = "Invalid Email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before dispatching action
    if (!validateForm()) return;

    // SweetAlert confirmation popup
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // If user confirms, dispatch the update action
        await dispatch(updateAddressAsync({ addressId: id, updatedData: formData }));

        // Show success message after update
        Swal.fire('Updated!', 'Your address has been updated.', 'success');

        // Redirect to the address management page after updating
        navigate('/userprofile/address');
      }
    });
  };

  return (
    <div className="edit-address-container">
      <h2 className="edit-address-title">Edit Address</h2>
      <form className="edit-address-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="form-input"
            required
          />
          {errors.city && <p className="error-message">{errors.city}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">State:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="form-input"
            required
          />
          {errors.state && <p className="error-message">{errors.state}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-textarea"
            required
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Pincode:</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="form-input"
            required
          />
          {errors.pincode && <p className="error-message">{errors.pincode}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Address Type:</label>
          <input
            type="text"
            name="addressType"
            value={formData.addressType}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Landmark:</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile:</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="form-input"
            required
          />
          {errors.mobile && <p className="error-message">{errors.mobile}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Alternate Contact:</label>
          <input
            type="text"
            name="alternate"
            value={formData.alternate}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Update Address</button>
      </form>
    </div>
  );
};

export default EditAddress;
