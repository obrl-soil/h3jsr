
<!-- README.md is generated from README.Rmd. Please edit that file -->

[![R build
status](https://github.com/obrl-soil/h3jsr/workflows/R-CMD-check/badge.svg)](https://github.com/obrl-soil/h3jsr/actions)
[![R build
status](https://github.com/obrl-soil/h3jsr/workflows/test-coverage/badge.svg)](https://github.com/obrl-soil/h3jsr/actions)
[![R build
status](https://github.com/obrl-soil/h3jsr/workflows/pkgdown/badge.svg)](https://github.com/obrl-soil/h3jsr/actions)
[![Coverage
status](https://codecov.io/gh/obrl-soil/h3jsr/branch/master/graph/badge.svg)](https://codecov.io/github/obrl-soil/h3jsr?branch=master)
[![CRAN](https://www.r-pkg.org/badges/version/h3jsr)](https://cran.r-project.org/package=h3jsr)
[![Downloads](https://cranlogs.r-pkg.org/badges/grand-total/h3jsr)](https://www.r-pkg.org/pkg/h3jsr)

# h3jsr

h3jsr provides access to [Uber’s H3 library](https://github.com/uber/h3)
via its [javascript transpile](https://github.com/uber/h3-js), using the
magical power of [`V8`](https://github.com/jeroen/v8).

H3 is a hexagonal hierarchical geospatial indexing system. Details about
its structure and use cases [can be found
here](https://h3geo.org/docs/).

## Installation

2021-07-07 This package is temporarily off-CRAN, until I can get it to
build on Solaris. In the meantime, grab the release file for v1.2.2 if
you need the version that was on CRAN, or install from github per below.

Install the development version from GitHub with

``` r
remotes::install_github("obrl-soil/h3jsr")
```

## Example

``` r
library(h3jsr)
library(sf)
#> Linking to GEOS 3.9.0, GDAL 3.2.1, PROJ 7.2.1

# where is the Brisbane Town Hall at resolution 15?
bth <- st_sfc(st_point(c(153.023503, -27.468920)), crs = 4326)
point_to_h3(bth, res = 15)
#> [1] "8fbe8d12acad2f3"

# where is it at several resolutions?
point_to_h3(bth, res = seq(10, 15), simple = FALSE)
#>   h3_resolution_10 h3_resolution_11 h3_resolution_12 h3_resolution_13
#> 1  8abe8d12acaffff  8bbe8d12acadfff  8cbe8d12acad3ff  8dbe8d12acad2ff
#>   h3_resolution_14 h3_resolution_15
#> 1  8ebe8d12acad2f7  8fbe8d12acad2f3

# Where is the center of the hexagon over the Brisbane Town 
# Hall at resolution 10?
brisbane_10 <- h3_to_point(h3_address = '8abe8d12acaffff')
brisbane_10
#> Geometry set for 1 feature 
#> Geometry type: POINT
#> Dimension:     XY
#> Bounding box:  xmin: 153.0239 ymin: -27.46853 xmax: 153.0239 ymax: -27.46853
#> Geodetic CRS:  WGS 84
#> POINT (153.0239 -27.46853)

# Is that a valid H3 address?
is_valid(h3_address = '8abe8d12acaffff')
#> [1] TRUE

# is it a pentagon?
is_pentagon(h3_address = '8abe8d12acaffff')
#> [1] FALSE

# is it Class III?
is_rc3(h3_address = '8abe8d12acaffff')
#> [1] FALSE

# What is Brisbane Town Hall's base cell number?
get_base_cell(h3_address = '8abe8d12acaffff')
#> [1] 95

# What is the hexagon over the Brisbane Town Hall at resolution 10?
brisbane_hex_10 <- h3_to_polygon(input = '8abe8d12acaffff', simple = FALSE)

# if you're feeling fancy,
# point_to_h3(bth, res = seq(10,15)) %>%
#   unlist() %>%
#   h3_to_polygon(., simple = FALSE) %>%
#   mapview::mapview()
  
```

Props to Joel Gombin, who’s package
[`concaveman`](https://github.com/joelgombin/concaveman) provided me
with the implementation inspo.

------------------------------------------------------------------------
