context('H3 custom functions')

test_that(
  'cell_to_line returns correctly - vector',
  c(path <- c("8abe8d12adaffff", "8abe8d10536ffff", "8abe8d10526ffff",
              "8abe8d12a52ffff", "8abe8d12aceffff", "8abe8d12ac2ffff"),
    val1 <- cell_to_line(path),
    val2 <- cell_to_line(path, simple = FALSE),
    expect_is(val1, 'sfc_LINESTRING'),
    expect_length(val1, 1),
    expect_is(val2, 'sf'),
    expect_equal(ncol(val2), 2),
    expect_type(val2$input, 'list'),
    expect_is(val2$geometry, 'sfc_LINESTRING')
  )
)

test_that(
  'cell_to_line returns correctly - list of vectors',
  c(path <- c("8abe8d12adaffff", "8abe8d10536ffff", "8abe8d10526ffff",
              "8abe8d12a52ffff", "8abe8d12aceffff", "8abe8d12ac2ffff"),
    paths <- list(path, path, path),
    val1 <- cell_to_line(paths),
    val2 <- cell_to_line(paths, simple = FALSE),
    expect_is(val1, 'sfc_LINESTRING'),
    expect_length(val1, 3),
    expect_is(val2, 'sf'),
    expect_equal(ncol(val2), 2),
    expect_equal(nrow(val2), 3),
    expect_type(val2$input, 'list'),
    expect_is(val2$geometry, 'sfc_LINESTRING')
    )
)

test_that(
  'cell_to_line returns correctly - data.frame with list-column',
  c(library(sf),
    brisbane_hex_10 <- cell_to_polygon(input = '8abe8d12acaffff'),
    hex_sample <- get_disk_list('8abe8d12acaffff', 4)[[1]][[4]][seq(1,18,3)],
    hex_sample_polys <- cell_to_polygon(hex_sample),
    paths <- grid_path(rep('8abe8d12acaffff', 6), hex_sample),
    paths_df <- data.frame('ID' = seq(6), 'paths' = I(paths)),
    val1 <- cell_to_line(paths_df),
    val2 <- cell_to_line(paths_df, simple = FALSE),
    expect_is(val1, 'sfc_LINESTRING'),
    expect_length(val1, 6),
    expect_is(val2, 'sf'),
    expect_equal(ncol(val2), 3),
    expect_equal(nrow(val2), 6),
    ins <- sf::st_set_geometry(val2, NULL), # wierd behav when lib() missing
    expect_identical(ins, paths_df),
    expect_is(val2$geometry, 'sfc_LINESTRING')
    )
)
