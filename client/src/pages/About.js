import React from "react";
import Layout from "./../components/Layout/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommer app"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/about.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <p className="text-justify mt-2">
          Welcome to Techhub, your trusted destination for the latest gadgets and innovative technology. At Techhub, we aim to make modern technology accessible, reliable, and affordable for everyone.

We offer a wide range of gadgets including smartphones, laptops, accessories, and smart devices, carefully selected to meet quality and performance standards. Our platform is designed to provide a smooth and secure shopping experience, backed by transparent pricing and customer-focused service.

At Techhub, we believe technology should simplify life and empower people. Whether you are a tech enthusiast or a casual user, Techhub is here to help you stay connected with the tools that matter most.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;