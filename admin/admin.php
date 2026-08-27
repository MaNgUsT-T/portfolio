<?php

declare(strict_types=1);

require __DIR__ . '/admin-lib.php';

adminStartSession();
adminSendCrawlerBlockHeaders();

if (!adminIsAuthenticated()) {
    adminRedirectToLogin();
}

$flash = adminConsumeFlash();
$siteData = [];
$templateData = [];
$loadError = null;

try {
    $siteData = adminLoadSiteData();
    $templateData = adminLoadTemplateData();
} catch (RuntimeException $exception) {
    $loadError = $exception->getMessage();
}
?>
<!DOCTYPE html>
<html lang="<?= adminEscape(adminDocumentLanguage()) ?>">
<?= adminRenderHead(['title_suffix_key' => 'admin.page_suffix']) ?>
<body class="admin-content">
    <?= adminRenderSiteHeader($siteData, true) ?>
	<main>
		<section>
			<div class="container">
				<h1><?= adminEscape(adminT('admin.heading')) ?></h1>
				<p><?= adminEscape(adminT('admin.structured_intro')) ?> <code>data/data.json</code>.</p>
				<p><span class="pill"><?= adminEscape(adminT('admin.badge.direct_save')) ?></span> <span class="pill"><?= adminEscape(adminT('admin.badge.csrf')) ?></span> <span class="pill"><?= adminEscape(adminT('admin.badge.utf8_json')) ?></span></p>

				<?php if ($flash !== null): ?>
					<div class="alert alert--<?= adminEscape($flash['type']) ?>">
						<?= adminEscape($flash['message']) ?>
					</div>
				<?php endif; ?>

				<?php if ($loadError !== null): ?>
					<div class="alert alert--error"><?= adminEscape($loadError) ?></div>
				<?php endif; ?>

			</div>
		</section>

		<?php if ($loadError == null): ?>
			<div class="admin-tabs" data-tabs>
				<section role="tablist" aria-label="<?= adminEscape(adminT('tabs.editor_modes')) ?>">
					<div class="container">
						<button type="button" class="tab-button is-active" data-tab-trigger="structured" role="tab">
							<?= adminEscape(adminT('tabs.content')) ?>
						</button>
						<button type="button" class="tab-button" data-tab-trigger="json" role="tab">
							<?= adminEscape(adminT('tabs.json')) ?>
						</button>
					</div>
				</section>

				<div class="tab-panel is-active" data-tab-panel="structured" role="tabpanel">
					<?= adminRenderFields($siteData, $templateData) ?>
				</div>

				<div class="tab-panel" data-tab-panel="json" role="tabpanel" hidden>
					<section>
						<div class="container">
							<p class="preheader"><?= adminEscape(adminT('admin.raw_json_hint')) ?></p>
							<h2><?= adminEscape(adminT('admin.raw_json_heading')) ?></h2>
							<div class="card card--default-inner">
								<div class="card__body">
									<div class="card__body-wrapper">
										<form method="post" action="./admin-save.php" id="json-form" class="admin-form">
											<input type="hidden" name="mode" value="json">
											<input type="hidden" name="csrf_token" value="<?= adminEscape(adminCsrfToken()) ?>">
											<div class="form-group">
												<textarea
													name="json-payload"
													rows="32"
												><?= adminEscape(
												json_encode(
														$siteData,
														JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
													) ?: ''
												) ?></textarea>
												<span data-form-error="message"></span></div>
										</form>
									</div>
								</div>
								<div class="card__footer">
									<button
										type="submit"
										form="json-form"
										class="btn btn--primary btn--large"
									>
										<?= adminEscape(adminT('admin.save_json')) ?>
									</button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		<?php endif; ?>
	</main>
    <?= adminRenderSiteFooter($siteData) ?>
    <div class="backdrop" data-overlay></div>
    <?= adminRenderClientConfigScript() ?>
    <script src="../js/admin.min.js"></script>
</body>
</html>
