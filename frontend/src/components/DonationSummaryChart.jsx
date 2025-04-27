import React from "react";
import { Bar } from "react-chartjs-2";
import { Card } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DonationSummaryChart = ({ donations }) => {
  // Group donations by type and status
  const data = {
    labels: ["Money", "Items"],
    datasets: [
      {
        label: "Completed",
        data: [
          donations.filter(
            (d) => d.type === "money" && d.status === "Completed"
          ).length,
          donations.filter(
            (d) => d.type === "items" && d.status === "Received" // Changed from "Completed" to "Received" for schools
          ).length,
        ],
        backgroundColor: "#28a745",
      },
      {
        label: "Pending",
        data: [
          donations.filter((d) => d.type === "money" && d.status === "Pending")
            .length,
          donations.filter((d) => d.type === "items" && d.status === "Pending")
            .length,
        ],
        backgroundColor: "#ffc107",
      },
    ],
  };

  return (
    <Card>
      <Card.Header>
        <h5>Donation Summary</h5>
      </Card.Header>
      <Card.Body>
        <Bar data={data} />
      </Card.Body>
    </Card>
  );
};

export default DonationSummaryChart;
