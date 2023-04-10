<?php
defined( 'ABSPATH' ) || die();
/**
 * @psalm-var array<int,
 *  array<int,
 *      array{ link: string, name: string, similarity: int, m_photo: string, f_photo: string }
 *  >
 * > $result
 */
// phpcs:disable WordPressVIPMinimum.Security.ProperEscapingFunction.hrefSrcEscUrl -- links are relative, `esc_url()` prepends http://
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title>Results</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
</head>
<body>
	<div class="container-fluid">
		<table class="table table-sm table-bordered" aria-label="Video processing results">
			<thead>
				<tr>
					<th>Captured photo</th>
					<th>Matches</th>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $result as $detection_id => $data ) : ?>
				<tr>
					<td class="text-end">
						<img src="<?=esc_attr( "d/{$detection_id}.jpg" ); ?>" alt="" style="position: sticky; top: 10px"/>
					</td>
					<td>
						<?php if ( empty( $data ) ) : ?>
							<strong class="text-danger">No matches</strong>
						<?php else : ?>
							<ul class="listgroup">
								<?php foreach ( $data as $match_id => $match ) : ?>
								<li class="list-group-item">
									<a href="<?=esc_attr( $match['link'] ); ?>" class="fw-bold text-danger">
										<?=esc_html( $match['name'] ); ?>
									</a>
									(<?=esc_html( (string) $match['similarity'] ); ?>%)<br/>
									<img src="<?=esc_attr( "m/{$match_id}.jpg" ); ?>" alt=""/><br/>
									<a href="<?=esc_attr( $match['m_photo'] ); ?>" target="_blank" rel="noopener noreferrer">Matched photo</a><br/>
									<a href="<?=esc_attr( $match['f_photo'] ); ?>" target="_blank" rel="noopener noreferrer">Main photo</a><br/>
								</li>
								<?php endforeach; ?>
							</ul>
						<?php endif; ?>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</body>
</html>
