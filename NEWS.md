# v.0.2.2

  * `h3_are_neighbours()` and `h3_get_udedge()` added

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
