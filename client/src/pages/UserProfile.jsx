import React from 'react'
import Profilesidebar from '../components/Sidebar/Profilesidebar'
import { Route, Routes } from 'react-router-dom'
import Useroverview from '../components/UserOverview/UserOverview'
import AddressManagement from '../components/UserAddress/AddressManagement'
import AddressForm from '../components/AddAdress/AddAddress'
import UserOrders from '../components/UserOrders/UserOrders'
import EditAddress from '../components/EditAddress/EditAddress'


const UserProfile = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Profilesidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="overview" element={<Useroverview />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="address" element={<AddressManagement />} />
          <Route path="address/add" element={<AddressForm />} />
          <Route path="address/edit/:id" element={<EditAddress />} />
          <Route path="wishlist" element={<Useroverview />} />
          <Route path="wallet" element={<Useroverview />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserProfile;
