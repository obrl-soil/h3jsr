<!-- README.md is generated from README.Rmd. Please edit that file -->
[![Travis-CI Build Status](https://travis-ci.com/obrl-soil/h3jsr.svg?branch=master)](https://travis-ci.com/obrl-soil/h3jsr) [![Coverage Status](https://img.shields.io/codecov/c/github/obrl-soil/h3jsr/master.svg)](https://codecov.io/github/obrl-soil/h3jsr?branch=master)

h3jsr
=====

h3jsr provides access to [Uber's H3 library](https://github.com/uber/h3) via its [javascript bindings](https://github.com/uber/h3-js), using the magical power of [`V8`](https://github.com/jeroen/v8). This is a stopgap package that should keep us \#rspatial nerds happy until someone writes proper R bindings.

H3 is a hexagonal hierarchical geospatial indexing system. Details about its structure and use cases [can be found here](https://uber.github.io/h3/#/documentation/overview/use-cases).

Installation
------------

Install from github with

``` r
devtools::install_github("obrl-soil/h3jsr")
```

Example
-------

``` r
library(h3jsr)
library(sf)
#> Warning: package 'sf' was built under R version 3.5.1
#> Linking to GEOS 3.6.1, GDAL 2.2.3, proj.4 4.9.3

# where is the Brisbane Town Hall at resolution 15?
bth <- st_sfc(st_point(c(153.023503, -27.468920)), crs = 4326)
geo_to_h3(bth, res = 15)
#> [1] "8fbe8d12acad2f3"

# where is it at several resolutions?
geo_to_h3(bth, res = seq(10, 15), simple = FALSE)
#> Simple feature collection with 1 feature and 6 fields
#> geometry type:  POINT
#> dimension:      XY
#> bbox:           xmin: 153.0235 ymin: -27.46892 xmax: 153.0235 ymax: -27.46892
#> epsg (SRID):    4326
#> proj4string:    +proj=longlat +datum=WGS84 +no_defs
#>   h3_resolution_10 h3_resolution_11 h3_resolution_12 h3_resolution_13
#> 1  8abe8d12acaffff  8bbe8d12acadfff  8cbe8d12acad3ff  8dbe8d12acad2ff
#>   h3_resolution_14 h3_resolution_15                   geometry
#> 1  8ebe8d12acad2f7  8fbe8d12acad2f3 POINT (153.0235 -27.46892)

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
# geo_to_h3(bth, res = seq(10,15)) %>%
#   h3_to_geo_boundary(., simple = FALSE) %>%
#   mapview::mapview()
#  
```

Props to Joel Gombin, who's package [`concaveman`](https://github.com/joelgombin/concaveman) provided me with the implementation inspo.

------------------------------------------------------------------------
