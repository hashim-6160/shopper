import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addAddressAsync } from '../../redux/address';
import { unwrapResult } from '@reduxjs/toolkit'; // Import unwrapResult for error handling
import Swal from 'sweetalert2'; // Import SweetAlert
import './AddAddress.css';

const AddressForm = () => {
  const dispatch = useDispatch();
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

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    if (type === 'radio') {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
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

    try {
      // Dispatch the action and use unwrapResult to get the resolved value
      const resultAction = await dispatch(addAddressAsync({ formData }));
      unwrapResult(resultAction); // If no error is thrown, it was successful

      // Display success SweetAlert
      Swal.fire({
        title: 'Success!',
        text: 'Address added successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // Clear form after successful submission
      setFormData({
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
      setErrors({}); // Clear errors
    } catch (error) {
      // If the action was rejected, display an error SweetAlert
      Swal.fire({
        title: 'Error!',
        text: `Failed to add address: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="address-form-container">
      <h2 className="form-title">Add New Address</h2>
      <p className="form-description">Fill in the below details to add a new address</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="city">City / District / Town</label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            {errors.city && <p className="error-message">{errors.city}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
            {errors.state && <p className="error-message">{errors.state}</p>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            required
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="pincode">Pin Code</label>
            <input
              type="text"
              id="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
            {errors.pincode && <p className="error-message">{errors.pincode}</p>}
          </div>
          <div className="form-group">
            <label>Address Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="addressType"
                  value="home"
                  checked={formData.addressType === 'home'}
                  onChange={handleChange}
                />
                Home
              </label>
              <label>
                <input
                  type="radio"
                  name="addressType"
                  value="work"
                  checked={formData.addressType === 'work'}
                  onChange={handleChange}
                />
                Work
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="landmark">Landmark</label>
          <input
            type="text"
            id="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <h3 className="section-title">Contact Information</h3>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
            {errors.mobile && <p className="error-message">{errors.mobile}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="alternate">Alternate Number</label>
          <input
            type="tel"
            id="alternate"
            value={formData.alternate}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-button">
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
