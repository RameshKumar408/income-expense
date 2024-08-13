"use client"
import { useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const DoughnutChart = ({ datas }) => {
    console.log("🚀 ~ DoughnutChart ~ datas:", datas)
    useEffect(() => {
        const ctx = document.getElementById('myDoughnutChart').getContext('2d');
        const myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Expense', 'Income'],
                datasets: [{
                    label: 'Income Expense',
                    data: datas,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                cutout: '50%', // Adjust the cutout percentage as needed
            },
        });

        return () => {
            myDoughnutChart.destroy();
        };
    }, [datas]);

    return <canvas id="myDoughnutChart" width="400" height="400"></canvas>;
};

export default DoughnutChart;