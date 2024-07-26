import React from "react";

interface OpenUrlButtonProps {
  url: string;
}

const OpenUrlButton: React.FC<OpenUrlButtonProps> = ({ url }) => {
  const openInNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="max-w-[200px] cursor-pointer truncate"
      title={url}
      onClick={openInNewTab}
    >
      {url ? url : "No Url"}
    </div>
  );
};

export default OpenUrlButton;
