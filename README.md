<!-- README.md is generated from README.Rmd. Please edit that file -->
h3jsr
=====

h3jsr provides access to [Uber's H3 library](https://github.com/uber/h3) via its [javascript bindings](https://github.com/uber/h3-js), using the magical power of [`V8`](https://github.com/jeroen/v8). This is a stopgap package that should keep us \#rspatial nerds happy until someone writes proper R bindings.

H3 is a hexagonal hierarchical geospatial indexing system.

Installation
------------

Install from github with

``` r
devtools::install_github("obrl-soil/h3jsr")
```

Example
-------

At the moment, only a couple of core API functions are enabled. These are the functions that convert a location to a H3 address, and convert an address back to a location.

``` r
library(h3jsr)

# where is the Brisbane Town Hall at resolution 15?
brisbane <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15)

# where is it at multiple resolutions?
brisbane_all <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15))

# Where is the center of the hexagon over the Brisbane Town 
# Hall at resolution 10?
brisbane_10 <- h3_to_geo(h3_address = '8aa4c4add727fff')
```

Props to Joel Gombin, who's package [`concaveman`](https://github.com/joelgombin/concaveman) provided me with the implementation inspo.

------------------------------------------------------------------------
