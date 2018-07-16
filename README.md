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

At the moment, only the core API functions are accessible.

``` r
library(h3jsr)

# where is the Brisbane Town Hall at resolution 15?
geo_to_h3(lon = 153.023503, lat = -27.468920, res = 15)
#>          X         Y res      h3_address
#> 1 153.0235 -27.46892  15 8fbe8d12acad2f3

# where is it at multiple resolutions?
geo_to_h3(lon = 153.023503, lat = -27.468920, res = seq(15))
#>           X         Y res      h3_address
#> 1  153.0235 -27.46892   1 81bebffffffffff
#> 2  153.0235 -27.46892   2 82be8ffffffffff
#> 3  153.0235 -27.46892   3 83be8dfffffffff
#> 4  153.0235 -27.46892   4 84be8d1ffffffff
#> 5  153.0235 -27.46892   5 85be8d13fffffff
#> 6  153.0235 -27.46892   6 86be8d12fffffff
#> 7  153.0235 -27.46892   7 87be8d12affffff
#> 8  153.0235 -27.46892   8 88be8d12adfffff
#> 9  153.0235 -27.46892   9 89be8d12acbffff
#> 10 153.0235 -27.46892  10 8abe8d12acaffff
#> 11 153.0235 -27.46892  11 8bbe8d12acadfff
#> 12 153.0235 -27.46892  12 8cbe8d12acad3ff
#> 13 153.0235 -27.46892  13 8dbe8d12acad2ff
#> 14 153.0235 -27.46892  14 8ebe8d12acad2f7
#> 15 153.0235 -27.46892  15 8fbe8d12acad2f3

# Where is the center of the hexagon over the Brisbane Town 
# Hall at resolution 10?
brisbane_10 <- h3_to_geo(h3_address = '8abe8d12acaffff')
#> Warning in if (h3_is_valid(h3_address) == FALSE) {: the condition has
#> length > 1 and only the first element will be used
brisbane_10
#>        h3_address     h3_x      h3_y
#> 1 8abe8d12acaffff 153.0239 -27.46853

# Is that a valid H3 address?
h3_is_valid(h3_address = '8abe8d12acaffff')
#>        h3_address h3_valid
#> 1 8abe8d12acaffff     TRUE

# is it a pentagon?
h3_is_pentagon(h3_address = '8abe8d12acaffff')
#> Warning in if (h3_is_valid(h3_address) == FALSE) {: the condition has
#> length > 1 and only the first element will be used
#>        h3_address h3_pentagon
#> 1 8abe8d12acaffff       FALSE

# is it Class III?
h3_is_rc3(h3_address = '8abe8d12acaffff')
#> Warning in if (h3_is_valid(h3_address) == FALSE) {: the condition has
#> length > 1 and only the first element will be used
#>        h3_address h3_rc3
#> 1 8abe8d12acaffff  FALSE

# What is Brisbane Town Hall's base cell number?
h3_get_base_cell(h3_address = '8abe8d12acaffff')
#> Warning in if (h3_is_valid(h3_address) == FALSE) {: the condition has
#> length > 1 and only the first element will be used
#>        h3_address h3_base_cell
#> 1 8abe8d12acaffff           95

# What is Brisbane Town Hall's base cell number?
#' h3_get_res(h3_address = '8abe8d12acaffff')

# What is the hexagon over the Brisbane Town Hall at resolution 10?
brisbane_hex_10 <- h3_to_geo_boundary(h3_address = '8abe8d12acaffff')
#> Warning in if (h3_is_valid(h3_address) == FALSE) {: the condition has
#> length > 1 and only the first element will be used

# if you're feeling fancy,
#sf::st_polygon(brisbane_hex_10$h3_hex) %>%
#  sf::st_sfc(., crs = 4326) %>%
#  mapview::mapview()
```

Props to Joel Gombin, who's package [`concaveman`](https://github.com/joelgombin/concaveman) provided me with the implementation inspo.

------------------------------------------------------------------------
