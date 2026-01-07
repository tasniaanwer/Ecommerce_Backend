import React from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";

const Users = () => {
  return (
    <Layout>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="card w-75 p-3">
              <h3>Users Management</h3>
              <p>Users list will be displayed here.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
