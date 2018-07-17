<!-- README.md is generated from README.Rmd. Please edit that file -->
[![Travis-CI Build Status](https://travis-ci.org/obrl-soil/h3jsr.svg?branch=master)](https://travis-ci.org/obrl-soil/h3jsr) [![Coverage Status](https://img.shields.io/codecov/c/github/obrl-soil/h3jsr/master.svg)](https://codecov.io/github/obrl-soil/h3jsr?branch=master)

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

At the moment, the core API functions are accessible, along with a couple of helper algorithms.

``` r
library(h3jsr)

# where is the Brisbane Town Hall at resolution 15?
geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15)
#> [1] "8fbe8d12acad2f3"

# where is it at multiple resolutions?
geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15))
#>  [1] "81bebffffffffff" "82be8ffffffffff" "83be8dfffffffff"
#>  [4] "84be8d1ffffffff" "85be8d13fffffff" "86be8d12fffffff"
#>  [7] "87be8d12affffff" "88be8d12adfffff" "89be8d12acbffff"
#> [10] "8abe8d12acaffff" "8bbe8d12acadfff" "8cbe8d12acad3ff"
#> [13] "8dbe8d12acad2ff" "8ebe8d12acad2f7" "8fbe8d12acad2f3"

# Where is the center of the hexagon over the Brisbane Town 
# Hall at resolution 10?
brisbane_10 <- h3_to_geo(h3_address = '8abe8d12acaffff')
brisbane_10
#>       h3_x      h3_y
#> 1 153.0239 -27.46853

# Is that a valid H3 address?
h3_is_valid(h3_address = '8abe8d12acaffff')
#> [1] TRUE

# is it a pentagon?
h3_is_pentagon(h3_address = '8abe8d12acaffff')
#> [1] FALSE

# is it Class III?
h3_is_rc3(h3_address = '8abe8d12acaffff')
#> [1] FALSE

# What is Brisbane Town Hall's base cell number?
h3_get_base_cell(h3_address = '8abe8d12acaffff')
#> [1] 95

# What is the hexagon over the Brisbane Town Hall at resolution 10?
brisbane_hex_10 <- h3_to_geo_boundary(h3_address = '8abe8d12acaffff')

# if you're feeling fancy,
#sf::st_polygon(brisbane_hex_10$h3_hex) %>%
#  sf::st_sfc(., crs = 4326) %>%
#  mapview::mapview()
```

Props to Joel Gombin, who's package [`concaveman`](https://github.com/joelgombin/concaveman) provided me with the implementation inspo.

------------------------------------------------------------------------
