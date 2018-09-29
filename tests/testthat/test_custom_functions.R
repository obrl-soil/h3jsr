context('Custom Functions')

test_that(
  'min_path returns correctly',
  c(
      expect_error(min_path('whereami', 'whoami')),
      expect_error(min_path('86be8d127ffffff')),
      # res mismatch:
      expect_error(min_path('86be8d127ffffff', '85be0e37fffffff')),
      # neighbours
      val1 <- min_path('86be8d12fffffff', '86be8d127ffffff'),
      expect_message(min_path('86be8d12fffffff', '86be8d127ffffff'),
                     'Origin and Destination are neighbours.'),
      expect_is(val1, 'list'),
      expect_length(val1[[1]], 2L),
      # normal
      SYD <- point_to_h3(sf::st_sfc(sf::st_point(c(151.2094, -33.865)),
                                    crs = 4326), res = 6),
      MLB <- point_to_h3(sf::st_sfc(sf::st_point(c(144.9631, -37.814)),
                                    crs = 4326),  res = 6),
      SYD_MLB <- min_path(SYD, MLB, simple = FALSE),
      expect_is(SYD_MLB, 'sf'),
      expect_length(SYD_MLB$path[[1]], 114L),
      expect_equal(SYD_MLB$path[[1]][1], SYD),
      expect_equal(SYD_MLB$path[[1]][length(SYD_MLB$path[[1]])], MLB),
      expect_equal(as.character(sf::st_geometry_type(SYD_MLB)), 'LINESTRING'),
      # too far away
      LAX <- point_to_h3(sf::st_sfc(sf::st_point(c(-118.25, 34.05)),
                                    crs = 4326), res = 6),
      #expect_message(min_path(SYD, LAX), 'h3jsr::grid_distance() has failed for these two points.'),
      SYD_LAX <- min_path(SYD, LAX),
      expect_is(SYD_LAX, 'list'),
      expect_length(SYD_LAX[[1]], 2L),
      SYD_LAX <- min_path(SYD, LAX, simple = FALSE),
      expect_is(SYD_LAX, 'sf'),
      expect_length(SYD_LAX$path[[1]], 2L),
      expect_equal(as.character(sf::st_geometry_type(SYD_LAX)), 'LINESTRING')
  )
)

test_that(
  'near_neigbours returns correctly',
  c(library(sf),
    Brisbane  <- sf::st_point(c(153.033333, -27.466667)),
    Toowoomba <- sf::st_point(c(151.95, -27.566667)),
    Gympie    <- sf::st_point(c(152.6655, -26.19)),
    Dalby     <- sf::st_point(c(151.266667, -27.183333)),
    Warwick   <- sf::st_point(c(152.016667, -28.216667)),
    Esk       <- sf::st_point(c(152.416667, -27.233333)),
    places    <- sf::st_sfc(Brisbane, Toowoomba, Gympie, Dalby, Warwick, Esk),
    places    <- sf::st_sf('ID' = seq.int(length(places)),
                           'name' = c('Brisbane', 'Toowoomba', 'Gympie',
                                      'Dalby', 'Warwick', 'Esk'),
                           'geom' = places, crs = 4326,
                           stringsAsFactors = FALSE),
    places    <- sf::st_transform(places, crs = 28356),
    places    <- near_neighbours(places, res = 5),
    places2   <- near_neighbours(places, res = 6),
    places3   <- near_neighbours(places, res = 7),
    expect_is(places, 'sf'),
    expect_is(places$nn_geom, 'sfc'),
    expect_equal(ncol(places), 4),
    expect_equal(sf::st_crs(places$geom), sf::st_crs(places$nn_geom)),
    expect_equal(places$nn_geom, places2$nn_geom),
    expect_equal(places$nn_geom, places3$nn_geom),
    expect_equal(places$nn_geom[1][[1]], places$geom[6][[1]])
  )
)
