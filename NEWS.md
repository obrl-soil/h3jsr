# Version 1.3.1

  * Updated to h3-js 4.1.0
  * New functions `cell_to_childpos()`, `childpos_to_cell()` and `cell_to_children_size()`. See this [Observable notebook](https://observablehq.com/d/697d0ae050effa18) for use cases.

# Version 1.3.0

  * Updated to h3-js 4.0.1. Note that v4+ has extensive changes to the underlying API. Some functions in this package have been renamed for consistency:
    * `point_to_h3()` --> `point_to_cell()`
    * `h3_to_point()` --> `cell_to_point()`
    * `h3_to_polygon()` --> `cell_to_polygon()`
    * `h3_to_line()` --> `cell_to_line()`
    * `get_kring()` --> `get_disk()`
    * `get_kring_list()` --> `get_disk_list()`
    * `polyfill()` --> `polygon_to_cells()`
    * `set_to_multipolygon()` --> `cells_to_multipolygon()`
    * `res_count()` --> `num_cells()`
  * New functions `is_valid_vertex()`, `get_cell_vertex()`, `get_cell_vertexes()`, and `vertex_to_point()` are available for interacting with H3 in vertex mode.
  * New functions `cell_to_splitlong()` and `splitlong_to_cell()` are available for converting between 64-bit string addresses and 32-bit integer pairs.
  * New functions `degs_to_rads()` and `rads_to_degs()` available for unit conversion.

# Version 1.2.3 [CRAN] 

  * Updated `V8` version requirement to ensure consistent build across platforms

# Version 1.2.2 [CRAN]

  * Updated to h3-js 3.7.2

# Version 1.2.1 

  * Updated to h3-js 3.7.1

# Version 1.2.0 

  * Updated to h3-js 3.7.0
  * Added functions `cell_area`, `edge_length`, `get_dist`, and `get_res0`.
  * Revised internal function `prep_for_pt2h3`

# Version 1.1.3 

  * Updated to h3-js 3.6.4

# Version 1.1.2 

  * Updated to h3-js 3.6.3 - polyfill algo was rolled back due to known issues
  * Move to Github Actions for CI workflow
  * Remove unneeded lwgeom dependency
  * Bugfix for accessing `h3_info_table` when library not loaded explicitly

# Version 1.1.1 

  * Updated to h3-js 3.6.2 - expect improvements to `polyfill()` behaviour

# Version 1.1

  * Updated to h3-js 3.6.1
  * Added `get_centerchild()`, which will return the central child of a hexagon at a given resolution.
  * Added `get_pentagons()`, which will return the twelve pentagon indexes at a given resolution.
  
# Version 1.0

  * Updated to h3-js 3.5.0, now using official browser bundle
  * Added `get_faces()`, which returns the icosahedron face(s) for a given H3 address.

# Version 0.9

  * Updated to h3-js 3.4.2  
  * Replaced custom function `min_path()` with official version `grid_path()`, which wraps `h3Line` to find a path between 
    two addresses.
  * Added custom function `h3_to_line()`, which converts a vector of H3 addresses to `sfc_LINESTRING`.

# Version 0.8

  * Updated to h3-js 3.3.0 and babel-polyfill 6.26.0

# Version 0.7

  * Removed `nearest_neighbour()`, its fundamentally flawed. 
  * Simplified output of `get_local_ij()` to a matrix when simple = TRUE
  * Improved outputs from `h3_to_point()`
  * Efficiency improvements to `h3_to_point()` and `polyfill()`
  * `h3_to_point()`, `h3_to_polygon()`, and `polyfill()` now take a wider range of input objects.

# Version 0.6

  * Update core library to v 3.2.0
  * Add `get_local_ij()` and `get_local_h3()`, wrapping the experimental local coordinate system functions `h3.experimentalH3ToLocalIj` and `h3.experimentalLocalIjToH3` respectively.

# Version 0.5.1
  
  * Added custom function `min_path()` to find a minimum-steps path between two H3 addresses of the same resolution.
  * Added custom function `nearest_neighbour()` to find the nearest neighbour for a given set of points. Use with caution, read the notes.

# Version 0.5.0
 
  * change to v8 session handling (speed enhancement)

# Version 0.4.5

  * update core library to v 3.1.1

# Version 0.4.4
 
  * bugfix for `polyfill()`. Where input `sf` object only has a geometry column, a column called 'ID_H3' containing a sequential ID field is now added before sending the geometry to the V8 session.

# Version 0.4.3

  * Update h3-js to release 3.1.0 - https://github.com/uber/h3-js/releases/tag/v3.1.0
  * Add `grid_distance()`, which returns the number of 'steps' required to get from one H3 address to another (within the same resolution).

# Version 0.4.2

  * Update h3-js to release 3.0.2 - https://github.com/uber/h3-js/releases/tag/v3.0.2

# Version 0.4.1

  * Warnings converted to messages
  * Multipolygon support for `h3_polyfill()`, plus a message when output resolution is way smaller than input extent.

# Version 0.4.0

  * Naming things is hard, but its vignette time so, y'know, now or never. Function names are shorter now and make more sense.
  * Added another info utility `res_cendist()` for getting the average distance between the center of each region represented by a H3 address at a given resolution.
  * Vignette covering core functionality added.

# Version 0.3.1
  
  * Reworked `to_point()` to return an `sfc_POINT` object, or an `sf` point data frame where `simple = FALSE`.
  * Improved outputs of `to_polygon()` to have a similar structure to `h3_to_geo()`. 
  
# Version 0.3.0

  * Reworked `point_to_h3()` to take in an `sf` point object and return the same when `simple = FALSE`, resulting in a new dependency on `tidyr`. On the upside, one can now request addresses for multiple resolutions at multiple points, if one wishes to test the limits of one's system.

# Version 0.2.3

  * Added public informational utilities `res_area()`, `res_edgelen()`, and `res_count()`
  * Added data table of h3 address info for fast retrieval of information using the above functions
  * Fixed resolution validation bug, level 0 is now allowed

# Version 0.2.2

  * All unidirectional algorithms added: `are_neighbours()`, `get_udedge()`, `is_valid_edge()`, `get_udorigin()`, `get_uddest()`, `get_udends()`, `get_udedges()`, and `udedge_to_line()`.

# Version 0.2.1
  
  * `polyfill()` and `set_to_multipolygon()` added; new dependencies on `sf`and `geojsonsf` have resulted.
  * `to_polygon()` now returns an object with `sf` geometry.
  * `compact()` and `uncompact()` added, all public core algorithms now available.

# Version 0.1.3
  
  * Simplified default output behaviour
  * `get_parent()`, `get_children()`, `get_kring()`, `get_kring_list()`, and `get_ring()` added.

# Version 0.1.2

  * Added remaining core functions `is_valid()`, `is_pentagon()`, `is_rc3()`, `get_base_cell()`, `get_res()`, and `to_polygon()`.
  * unit tests on all core functions.
  
# Version 0.1.1
 
  * `to_point()` added.
  * `point_to_h3()` bugfix. A pox on devs who think y,x is ok.
  * NEWS and README added.

# Version 0.1.0

  * `point_to_h3()` - first function implemented.
