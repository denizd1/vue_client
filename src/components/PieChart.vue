<template>
  <Pie
    :chart-options="chartOptions"
    :chart-data="chartData"
    :width="width"
    :height="height"
  />
</template>
<script>
import { Pie } from "vue-chartjs/legacy";
import TutorialDataService from "../services/TutorialDataService";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default {
  name: "PieChart",
  components: { Pie },
  props: {
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            borderWidth: 1,
            borderColor: [],
            backgroundColor: [],
            data: [],
          },
        ],
      },
      chartOptions: {
        legend: {
          display: true,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  methods: {
    generateHslaColors(saturation, lightness, alpha, amount) {
      let colors = [];
      let huedelta = Math.trunc(360 / amount);

      for (let i = 0; i < amount; i++) {
        let hue = i * huedelta;
        colors.push(`hsla(${hue},${saturation}%,${lightness}%,${alpha})`);
      }

      return colors;
    },
  },
  //get number of tutorials for each alt_yontem before rendering the chart
  beforeMount() {
    TutorialDataService.AltYontemCount()
      .then((response) => {
        this.chartData.labels = response.data.map((item) => item.alt_yontem);
        this.chartData.datasets[0].data = response.data.map(
          (item) => item.count
        );
        this.chartData.datasets[0].backgroundColor = this.generateHslaColors(
          100,
          50,
          0.5,
          this.chartData.labels.length
        );
        this.chartData.datasets[0].borderColor = this.generateHslaColors(
          100,
          50,
          1,
          this.chartData.labels.length
        );
      })
      .catch((e) => {
        console.log(e);
      });
  },
};
</script>
