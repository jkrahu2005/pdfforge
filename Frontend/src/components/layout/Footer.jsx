// components/layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
      <aside>
        <div className="grid grid-flow-col gap-4">
          <span className="text-3xl">🗂️</span>
        </div>
        <p className="font-bold text-lg">
          PDFMaster <br />Your Complete PDF Solution
        </p>
        <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
      </aside>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;