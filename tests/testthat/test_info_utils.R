context('info utils')

test_that(
  'h3_res_area returns correctly',
  c(
    expect_error(res_area(8, 'cubic furlongs')),
    expect_error(res_area(25, 'm2')),
    expect_equal(res_area(14, 'm2'), 6.3),
    expect_equal(res_area(7, 'km2'), 5.1612932),
    expect_equal(res_area(14, 'm2', fast = FALSE)$area, 6.3),
    expect_equal(res_area(7, 'km2', fast = FALSE)$area, 5.1612932)
  )
)

test_that(
  'res_edgelen returns correctly',
  c(
    expect_error(res_length(8, 'cubic furlongs')),
    expect_error(res_length(25, 'm')),
    expect_equal(res_length(14, 'm'), 1.348574562),
    expect_equal(res_length(7, 'km'), 1.220629759),
    expect_equal(res_length(14, 'm', fast = FALSE)$edgelen, 1.348574562),
    expect_equal(res_length(7, 'km', fast = FALSE)$edgelen, 1.220629759)
  )
)

test_that(
  'res_cendist returns correctly',
  c(
    expect_error(res_cendist(8, 'cubic furlongs')),
    expect_error(res_cendist(25, 'm')),
    expect_equal(res_cendist(14, 'm'), 2.33579966),
    expect_equal(res_cendist(7, 'km'), 2.11419276),
    expect_equal(res_cendist(14, 'm', fast = FALSE), 2.33579966),
    expect_equal(res_cendist(7, 'km', fast = FALSE), 2.11419276)
  )
)

test_that(
  'h3_count returns correctly',
  c(
    expect_error(res_count(25)),
    expect_equal(res_count(14), 81386768741882),
    expect_equal(res_count(3), 41162),
    expect_equal(res_count(14, fast = FALSE)$total_unique_indexes,
                 81386768741882),
    expect_equal(res_count(3, fast = FALSE)$total_unique_indexes, 41162)
  )
)

