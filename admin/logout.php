<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();
$siteData = [];

try {
    $siteData = adminLoadSiteData();
} catch (RuntimeException $exception) {
    $siteData = [];
}

adminLogout();

$logoutRedirectScript = <<<'JS'
window.setTimeout(function() {
    window.location.href = './index.php';
}, 5000);
JS;
?>
<!DOCTYPE html>
<html lang="<?= adminEscape(adminDocumentLanguage()) ?>">
<?= adminRenderHead([
    'title_suffix_key' => 'logout.suffix',
    'meta_refresh' => '5;url=./index.php',
    'extra_inline_script' => $logoutRedirectScript,
]) ?>
<body class="admin-auth">
    <?= adminRenderSiteHeader($siteData) ?>
	<main>
		<section>
			<div class="container">
				<div class="card card--default-inner">
					<div class="card__body">
						<div class="card__body-wrapper">
							<div class="admin-logo">
								<?= adminIconSvg(adminHeaderLogoIconName($siteData)) ?>
							</div>
							<h3><?= adminEscape(adminT('logout.heading')) ?></h3>
							<p><?= adminEscape(adminT('logout.message')) ?></p>
						</div>
					</div>
					<div class="card__footer">
						<a href="./index.php" class="btn btn--primary btn--large"><?= adminEscape(adminT('auth.back_to_login')) ?></a>
					</div>
				</div>
			</div>
		</section>
	</main>
    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>
    <?= adminRenderClientConfigScript() ?>
    <script src="../js/admin.min.js"></script>
</body>
</html>
