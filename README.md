# Batted Ball Data Visualizer

This web app visualized batted ball data to create spray charts and plots.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

First, clone the repository.

```
git clone https://github.com/isaacrlee/batted-ball-data-visualizer.git
```

Then open `index.html`:
![Example Batted Ball Plots](https://github.com/isaacrlee/batted-ball-data-visualizer/raw/master/ScreenShot.png "Example Batted Ball Plots")

## Example Data

Excel and .csv files of example batted ball data in the required format are included: `BattedBallData.(csv|xlsx)`.

## Built With

* [Bootstrap](https://getbootstrap.com/) - The web framework used
* [Algolia](https://www.algolia.com/) - Data search
* [plotly.js](https://plot.ly/javascript/) - Used to generate charts

## Next Steps
* Batter and pitcher selection is buggy, should probably use Angular for true data binding.
* Add summary statistics.
* Plotly plots are clean but sparse, could use D3 to create better plots.
* Use a real database/back-end, Algolia is great but expensive with larger datasets.
* Add data from MLB AM API (handedness data).
* Synchronize plots.
