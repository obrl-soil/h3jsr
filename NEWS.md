# v. 0.2.3

  * Added public informational utilities `h3_res_area()`, `h3_res_edgelen()`, and `h3_count()`
  * Added data table of h3 address info for fast retrieval of information using the above functions
  * Fixed resolution validation bug, level 0 is now allowed

# v.0.2.2

  * All unidirectional algorithms added: `h3_are_neighbours()`, `h3_get_udedge()`, `h3_is_edge_valid()`, `h3_get_udorigin()`, `h3_get_uddest()`, `h3_get_udends()`, `h3_get_udedges()`, and `h3_to_geo_udedge()`.

# v. 0.2.1
  
  * `h3_polyfill()` and `h3_set_to_multipolygon()` added; new dependencies on `sf`and `geojsonsf` have resulted.
  * `h3_to_geo_boundary()` now returns an object with `sf` geometry.
  * `h3_compact()` and `h3_uncompact()` added, all public core algorithms now available.

# v. 0.1.3
  
  * Simplified default output behaviour
  * `h3_to_parent()`, `h3_to_children()`, `h3_get_kring()`, `h3_get_kring_list()`, and `h3_get_ring()` added.

# v. 0.1.2

  * Added remaining core functions `h3_is_valid()`, `h3_is_pentagon()`, `h3_is_rc3()`, `h3_get_base_cell()`, `h3_get_res()`, and `h3_to_geo_boundary()`.
  * unit tests on all core functions.
  
# v. 0.1.1
 
  * `h3_to_geo()` added.
  * `geo_to_h3()` bugfix. A pox on devs who think y,x is ok.
  * NEWS and README added.

# v. 0.1.0

  * `geo_to_h3()` - first function implemented.
