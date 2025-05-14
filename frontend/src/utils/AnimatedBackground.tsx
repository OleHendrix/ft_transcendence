import React from "react";
import "../css/AnimatedBackground.css";

function AnimatedBackground()
{
	return (
		<div>
			<div className="shape circle orange" style={{ top: "10%", left: "15%", animationDuration: "8s" }} />
			<div className="shape circle blue" style={{ top: "30%", left: "70%", animationDuration: "12s" }} />
			<div className="shape rect orange" style={{ top: "60%", left: "20%", animationDuration: "10s" }} />
			<div className="shape rect blue" style={{ top: "80%", left: "60%", animationDuration: "14s" }} />
			<div className="shape triangle orange" style={{ top: "50%", left: "50%", animationDuration: "11s" }} />
			<div className="shape triangle blue" style={{ top: "20%", left: "80%", animationDuration: "9s" }} />
			<div className="shape circle orange" style={{ top: "5%", left: "40%", animationDuration: "4.8s" }} />
			<div className="shape rect blue" style={{ top: "40%", left: "12%", animationDuration: "6.4s", width: "40px", height: "12px" }} />
			<div className="shape triangle blue" style={{ top: "70%", left: "18%", animationDuration: "5.6s" }} />
			<div className="shape circle blue" style={{ top: "85%", left: "10%", animationDuration: "3.2s", width: "20px", height: "20px" }} />
			<div className="shape rect orange" style={{ top: "25%", left: "3%", animationDuration: "5.6s", width: "20px", height: "8px" }} />
			<div className="shape circle blue" style={{ top: "12%", left: "55%", animationDuration: "7.1s", width: "40px", height: "50px" }} />
			<div className="shape rect orange" style={{ top: "77%", left: "33%", animationDuration: "8.3s", width: "80px", height: "24px" }} />
			<div className="shape triangle blue" style={{ top: "62%", left: "72%", animationDuration: "6.7s", borderLeft: "28px solid transparent", borderRight: "28px solid transparent", borderBottom: "50px solid #3b6ea8" }} />
			<div className="shape circle orange" style={{ top: "38%", left: "22%", animationDuration: "5.9s", width: "70px", height: "70px" }} />
			<div className="shape rect blue" style={{ top: "15%", left: "78%", animationDuration: "9.2s", width: "60px", height: "18px" }} />
		</div>
	)
}

export default AnimatedBackground;