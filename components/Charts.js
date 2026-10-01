'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title as ChartTitle } from 'chart.js';
import { Pie as PieChart, Bar as BarChart, Line as LineChart } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartTitle);

export const Pie = (props) => <PieChart {...props} />;
export const Bar = (props) => <BarChart {...props} />;
export const Line = (props) => <LineChart {...props} />;
